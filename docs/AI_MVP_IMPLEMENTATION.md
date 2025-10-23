# 🚀 AI/ML MVP Implementation Guide

**Goal:** Add the first 3 AI features to Garbaking POS in 6 weeks
**Budget:** $10,000 - $20,000
**Expected ROI:** 3-5x in first year

---

## 📋 **6-Week Implementation Plan**

### **Week 1-2: Sales Forecasting** 📊

#### **What It Does:**
Predicts daily demand for each menu item to reduce waste and optimize inventory.

#### **Tech Stack:**
```bash
# Install dependencies
pip install prophet pandas numpy scikit-learn fastapi uvicorn

# Database
PostgreSQL + TimescaleDB extension
```

#### **Step-by-Step:**

**Step 1: Collect Historical Data**
```sql
-- Extract order history
SELECT
    DATE(created_at) as date,
    menu_item_id,
    menu_item_name,
    SUM(quantity) as total_quantity,
    COUNT(DISTINCT order_id) as num_orders,
    AVG(unit_price) as avg_price
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
GROUP BY DATE(created_at), menu_item_id, menu_item_name
ORDER BY date DESC
```

**Step 2: Train Forecasting Model**
```python
# forecasting_model.py
from prophet import Prophet
import pandas as pd

def train_forecast_model(historical_data):
    """
    Train Prophet model for sales forecasting
    """
    # Prepare data for Prophet
    df = historical_data.rename(columns={
        'date': 'ds',
        'total_quantity': 'y'
    })

    # Create and train model
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        changepoint_prior_scale=0.05
    )

    # Add custom seasonality
    model.add_seasonality(
        name='monthly',
        period=30.5,
        fourier_order=5
    )

    # Fit model
    model.fit(df)

    return model

def predict_next_7_days(model):
    """
    Generate 7-day forecast
    """
    future = model.make_future_dataframe(periods=7)
    forecast = model.predict(future)

    return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(7)
```

**Step 3: Create API Endpoint**
```python
# backend/src/ml/forecast_api.py
from fastapi import FastAPI, HTTPException
from datetime import datetime, timedelta
import joblib

app = FastAPI()

# Load trained models
models = {}

@app.on_event("startup")
async def load_models():
    """Load all menu item forecast models"""
    # Load from disk
    models['attieke'] = joblib.load('models/attieke_forecast.pkl')
    models['poulet'] = joblib.load('models/poulet_forecast.pkl')
    # ... load other models

@app.get("/api/ml/forecast/{item_id}")
async def get_forecast(item_id: str, days: int = 7):
    """
    Get sales forecast for menu item
    """
    if item_id not in models:
        raise HTTPException(status_code=404, detail="Model not found")

    model = models[item_id]
    forecast = predict_next_7_days(model)

    return {
        "item_id": item_id,
        "forecasts": forecast.to_dict('records')
    }

@app.get("/api/ml/forecast/daily-summary")
async def daily_forecast_summary():
    """
    Get forecast summary for all items
    """
    tomorrow = datetime.now() + timedelta(days=1)
    summary = []

    for item_id, model in models.items():
        forecast = predict_next_7_days(model)
        tomorrow_forecast = forecast[forecast['ds'] == tomorrow.date()].iloc[0]

        summary.append({
            'item_id': item_id,
            'predicted_quantity': int(tomorrow_forecast['yhat']),
            'lower_bound': int(tomorrow_forecast['yhat_lower']),
            'upper_bound': int(tomorrow_forecast['yhat_upper'])
        })

    return summary
```

**Step 4: Create Dashboard Component**
```vue
<!-- frontend/admin-pos/src/components/ForecastDashboard.vue -->
<template>
  <div class="forecast-dashboard">
    <h2>Tomorrow's Demand Forecast</h2>

    <div class="forecast-cards">
      <div v-for="item in forecasts" :key="item.item_id" class="forecast-card">
        <h3>{{ item.item_name }}</h3>
        <div class="forecast-value">
          {{ item.predicted_quantity }} units
        </div>
        <div class="forecast-range">
          Range: {{ item.lower_bound }} - {{ item.upper_bound }}
        </div>

        <!-- Warning if stock is low -->
        <div v-if="item.current_stock < item.predicted_quantity" class="warning">
          ⚠️ Stock may run out! Order {{ item.predicted_quantity - item.current_stock }} more units
        </div>
      </div>
    </div>

    <!-- Chart -->
    <canvas ref="forecastChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart } from 'chart.js'

const forecasts = ref([])
const forecastChart = ref(null)

onMounted(async () => {
  // Fetch forecast data
  const response = await fetch('/api/ml/forecast/daily-summary')
  forecasts.value = await response.json()

  // Render chart
  renderChart()
})

function renderChart() {
  // Chart.js implementation
  // ... (7-day trend visualization)
}
</script>
```

**Expected Impact:**
- 30-50% reduction in food waste
- Better inventory planning
- Accurate purchasing decisions

---

### **Week 3-4: Smart Recommendations** 🎯

#### **What It Does:**
Suggests items customers are likely to order based on their history and similar customers.

#### **Algorithm: Collaborative Filtering**

**Step 1: Prepare Training Data**
```python
# recommendation_engine.py
import pandas as pd
from sklearn.neighbors import NearestNeighbors

def create_user_item_matrix():
    """
    Create matrix of customers x menu items
    """
    query = """
    SELECT
        customer_phone,
        menu_item_id,
        COUNT(*) as purchase_count
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.customer_phone IS NOT NULL
    GROUP BY customer_phone, menu_item_id
    """

    df = pd.read_sql(query, db_connection)

    # Pivot to create user-item matrix
    matrix = df.pivot_table(
        index='customer_phone',
        columns='menu_item_id',
        values='purchase_count',
        fill_value=0
    )

    return matrix

def train_collaborative_filter(matrix):
    """
    Train k-Nearest Neighbors model
    """
    model = NearestNeighbors(
        metric='cosine',
        algorithm='brute',
        n_neighbors=20
    )

    model.fit(matrix)

    return model, matrix
```

**Step 2: Generate Recommendations**
```python
def get_recommendations(customer_phone, model, matrix, n=5):
    """
    Get top N recommendations for customer
    """
    if customer_phone not in matrix.index:
        # New customer - return popular items
        return get_popular_items(n)

    # Get customer's purchase vector
    customer_vector = matrix.loc[customer_phone].values.reshape(1, -1)

    # Find similar customers
    distances, indices = model.kneighbors(customer_vector, n_neighbors=20)

    # Get items purchased by similar customers
    similar_customers = matrix.iloc[indices[0]]

    # Items customer hasn't tried yet
    customer_items = set(matrix.columns[customer_vector[0] > 0])

    # Calculate scores for recommendations
    recommendations = []
    for item in matrix.columns:
        if item not in customer_items:
            score = similar_customers[item].sum()
            recommendations.append({
                'item_id': item,
                'score': score
            })

    # Sort by score and return top N
    recommendations.sort(key=lambda x: x['score'], reverse=True)
    return recommendations[:n]
```

**Step 3: API Integration**
```python
# Add to FastAPI
@app.get("/api/ml/recommendations/{customer_phone}")
async def get_customer_recommendations(customer_phone: str):
    """
    Get personalized recommendations
    """
    recs = get_recommendations(customer_phone, rec_model, user_item_matrix, n=5)

    # Fetch menu item details
    item_ids = [r['item_id'] for r in recs]
    items = await db.fetch_menu_items(item_ids)

    return {
        'customer_phone': customer_phone,
        'recommendations': [
            {
                'item': item,
                'confidence_score': rec['score']
            }
            for rec, item in zip(recs, items)
        ]
    }
```

**Step 4: Frontend Integration**
```vue
<!-- In Menu.vue or Home.vue -->
<template>
  <div class="recommendations-section">
    <h2>Recommended for You</h2>
    <div class="recommendation-cards">
      <MenuItemCard
        v-for="item in recommendations"
        :key="item.id"
        :item="item"
        :badge="'Recommended'"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const recommendations = ref([])

onMounted(async () => {
  const phone = cartStore.customerInfo.phone

  if (phone) {
    const response = await fetch(`/api/ml/recommendations/${phone}`)
    const data = await response.json()
    recommendations.value = data.recommendations.map(r => r.item)
  }
})
</script>
```

**Expected Impact:**
- 15-25% increase in average order value
- More cross-selling opportunities
- Better customer experience

---

### **Week 5-6: Menu Engineering Analysis** 📈

#### **What It Does:**
Analyzes menu performance and provides optimization recommendations.

#### **Step 1: Calculate Menu Metrics**
```python
# menu_analysis.py
import pandas as pd
import numpy as np

def analyze_menu_performance():
    """
    Categorize menu items into Stars, Plowhorses, Puzzles, Dogs
    """
    query = """
    SELECT
        mi.id,
        mi.name,
        mi.category,
        mi.price,
        mi.cost,
        (mi.price - mi.cost) as profit_margin,
        COUNT(DISTINCT oi.order_id) as times_ordered,
        SUM(oi.quantity) as total_quantity_sold,
        AVG(r.rating) as avg_rating
    FROM menu_items mi
    LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
    LEFT JOIN reviews r ON mi.id = r.menu_item_id
    WHERE oi.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
    GROUP BY mi.id
    """

    df = pd.read_sql(query, db_connection)

    # Calculate profitability score (0-100)
    df['profitability_score'] = (
        (df['profit_margin'] - df['profit_margin'].min()) /
        (df['profit_margin'].max() - df['profit_margin'].min())
    ) * 100

    # Calculate popularity score (0-100)
    df['popularity_score'] = (
        (df['total_quantity_sold'] - df['total_quantity_sold'].min()) /
        (df['total_quantity_sold'].max() - df['total_quantity_sold'].min())
    ) * 100

    # Categorize items
    df['category'] = df.apply(categorize_item, axis=1)

    return df

def categorize_item(row):
    """
    Categorize based on profitability and popularity
    """
    profit = row['profitability_score']
    popularity = row['popularity_score']

    if profit >= 50 and popularity >= 50:
        return 'STAR'  # High profit, high popularity - PROMOTE
    elif profit < 50 and popularity >= 50:
        return 'PLOWHORSE'  # Low profit, high popularity - RAISE PRICE
    elif profit >= 50 and popularity < 50:
        return 'PUZZLE'  # High profit, low popularity - MARKET BETTER
    else:
        return 'DOG'  # Low profit, low popularity - REMOVE

def generate_recommendations(df):
    """
    Generate actionable recommendations
    """
    recommendations = []

    for _, item in df.iterrows():
        if item['category'] == 'STAR':
            recommendations.append({
                'item': item['name'],
                'action': 'PROMOTE',
                'reason': 'High profit & popularity',
                'suggestion': 'Feature prominently, increase inventory'
            })

        elif item['category'] == 'PLOWHORSE':
            price_increase = item['price'] * 0.10  # 10% increase
            recommendations.append({
                'item': item['name'],
                'action': 'RAISE PRICE',
                'reason': 'Popular but low profit',
                'suggestion': f'Increase price by {price_increase:.0f} FCFA'
            })

        elif item['category'] == 'PUZZLE':
            recommendations.append({
                'item': item['name'],
                'action': 'MARKET BETTER',
                'reason': 'Profitable but unpopular',
                'suggestion': 'Add to recommended items, improve description'
            })

        elif item['category'] == 'DOG':
            recommendations.append({
                'item': item['name'],
                'action': 'CONSIDER REMOVING',
                'reason': 'Low profit & popularity',
                'suggestion': 'Replace with better-performing alternative'
            })

    return recommendations
```

**Step 2: Dashboard Visualization**
```vue
<!-- MenuAnalysisDashboard.vue -->
<template>
  <div class="menu-analysis">
    <h1>Menu Engineering Analysis</h1>

    <!-- Menu Matrix -->
    <div class="menu-matrix">
      <div class="quadrant stars">
        <h3>⭐ Stars</h3>
        <p>High Profit • High Popularity</p>
        <div v-for="item in stars" :key="item.id">
          {{ item.name }}
        </div>
      </div>

      <div class="quadrant puzzles">
        <h3>❓ Puzzles</h3>
        <p>High Profit • Low Popularity</p>
        <div v-for="item in puzzles" :key="item.id">
          {{ item.name }}
        </div>
      </div>

      <div class="quadrant plowhorses">
        <h3>🐴 Plowhorses</h3>
        <p>Low Profit • High Popularity</p>
        <div v-for="item in plowhorses" :key="item.id">
          {{ item.name }}
        </div>
      </div>

      <div class="quadrant dogs">
        <h3>🐕 Dogs</h3>
        <p>Low Profit • Low Popularity</p>
        <div v-for="item in dogs" :key="item.id">
          {{ item.name }}
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div class="recommendations">
      <h2>Recommended Actions</h2>
      <div v-for="rec in recommendations" :key="rec.item" class="rec-card">
        <h3>{{ rec.item }}</h3>
        <div class="action">{{ rec.action }}</div>
        <p>{{ rec.reason }}</p>
        <p class="suggestion">💡 {{ rec.suggestion }}</p>
      </div>
    </div>
  </div>
</template>
```

**Expected Impact:**
- Identify underperforming items
- Optimize menu profitability by 15-20%
- Data-driven pricing decisions

---

## 🗄️ **Database Schema Additions**

```sql
-- Create ML models table
CREATE TABLE ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_type VARCHAR(50) NOT NULL, -- 'forecast', 'recommendation', etc.
    item_id VARCHAR(255), -- NULL for general models
    model_path VARCHAR(255) NOT NULL,
    accuracy_score DECIMAL(5,2),
    last_trained_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'deprecated', 'training'
    metadata JSONB, -- Store hyperparameters, feature importance, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create predictions table (audit trail)
CREATE TABLE ml_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES ml_models(id),
    prediction_type VARCHAR(50),
    input_data JSONB,
    prediction_result JSONB,
    actual_result JSONB, -- Filled in later for accuracy tracking
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create ML metrics table (monitor performance)
CREATE TABLE ml_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES ml_models(id),
    metric_name VARCHAR(50), -- 'MAE', 'RMSE', 'accuracy', etc.
    metric_value DECIMAL(10,4),
    measured_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📊 **Success Metrics**

Track these KPIs to measure AI impact:

### **Forecasting:**
- Mean Absolute Percentage Error (MAPE) < 15%
- Waste reduction: 30%+
- Stockout reduction: 80%+

### **Recommendations:**
- Click-through rate: > 20%
- Conversion rate: > 10%
- AOV increase: 15%+

### **Menu Analysis:**
- Menu profit margin improvement: 15%+
- Decisions made based on insights: Track quarterly
- Revenue from optimized items: Track monthly

---

## 🚀 **Deployment Checklist**

**Week 1-2: Forecasting**
- [ ] Extract 3 months historical data
- [ ] Train models for top 20 menu items
- [ ] Create FastAPI endpoint
- [ ] Deploy to cloud (DigitalOcean/AWS)
- [ ] Build admin dashboard
- [ ] Test accuracy for 1 week
- [ ] Roll out to production

**Week 3-4: Recommendations**
- [ ] Build user-item matrix
- [ ] Train collaborative filtering model
- [ ] Create API endpoint
- [ ] Integrate into customer app
- [ ] A/B test vs no recommendations
- [ ] Measure conversion rates
- [ ] Optimize based on results

**Week 5-6: Menu Analysis**
- [ ] Calculate all menu metrics
- [ ] Categorize all items
- [ ] Generate recommendations
- [ ] Create dashboard
- [ ] Present to management
- [ ] Implement pricing changes
- [ ] Track results monthly

---

## 💰 **Cost Breakdown**

### **Infrastructure (Monthly):**
```yaml
Cloud Computing (DigitalOcean/AWS):
  - CPU: 2 cores, 4GB RAM: $40/month
  - Database: PostgreSQL managed: $15/month
  - Storage: 50GB SSD: $5/month
  - Total: ~$60/month

ML Tools:
  - Prophet, Scikit-learn: FREE (open source)
  - FastAPI: FREE
  - Docker: FREE
```

### **Development (One-Time):**
```yaml
Week 1-2 (Forecasting):
  - ML Engineer: $3,000-5,000
  - Data prep: $1,000
  - Dashboard: $1,500
  - Total: $5,500-7,500

Week 3-4 (Recommendations):
  - ML Engineer: $3,000-5,000
  - Frontend integration: $1,500
  - Testing: $500
  - Total: $5,000-7,000

Week 5-6 (Menu Analysis):
  - Data analysis: $2,000
  - Dashboard: $2,000
  - Documentation: $500
  - Total: $4,500

Grand Total: $15,000-19,000
```

---

## 🎯 **Next Steps After MVP**

Once these 3 features are live:

1. **Monitor Performance** (Month 2)
   - Track accuracy
   - Measure business impact
   - Gather user feedback

2. **Iterate & Improve** (Month 3)
   - Retrain models with new data
   - Add more menu items to forecast
   - Improve recommendation algorithm

3. **Add Advanced Features** (Month 4+)
   - Churn prediction
   - Dynamic pricing
   - Chatbot
   - Computer vision

---

## 📞 **Getting Help**

### **Need an ML Engineer?**

**Freelance Platforms:**
- Upwork: $50-150/hour
- Toptal: $100-200/hour
- Fiverr: $500-5,000 per project

**What to Look For:**
- Python + FastAPI experience
- Scikit-learn, TensorFlow/PyTorch
- Time series forecasting (Prophet)
- Recommendation systems
- API development
- Restaurant/retail experience (bonus)

**Interview Questions:**
1. "How would you build a sales forecasting model with 3 months of data?"
2. "Explain collaborative filtering vs content-based recommendations"
3. "How would you deploy ML models to production?"
4. "How do you handle model drift?"

---

## 🎊 **Expected Results (First 3 Months)**

### **Quantitative:**
- 30% reduction in food waste
- 15% increase in average order value
- 15% improvement in menu profit margin
- 80% reduction in stockouts
- 50% faster menu optimization decisions

### **Qualitative:**
- Data-driven decision making
- Competitive advantage
- Better customer experience
- Reduced guesswork
- Increased confidence in operations

### **ROI Calculation:**
```
Investment: $15,000-19,000

Savings (monthly):
  - Waste reduction: $2,000
  - Better inventory: $1,000

Revenue increase (monthly):
  - Higher AOV: $3,000
  - Better pricing: $2,000

Total monthly benefit: $8,000
Break-even: 2-3 months
ROI Year 1: 400-500%
```

---

**Ready to add AI superpowers to your POS?** 🤖🚀

Start with forecasting next week! 📊
