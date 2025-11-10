/**
 * Draft Storage Utility using IndexedDB
 * Provides persistent storage for cart drafts with better reliability than localStorage
 */

export interface CartDraft {
  id: string
  name: string
  items: any[]
  customerName?: string
  customerPhone?: string
  paymentMethod?: string
  subtotal: number
  tax: number
  total: number
  createdAt: Date
  updatedAt: Date
  itemCount: number
}

const DB_NAME = 'garbaking_pos'
const DB_VERSION = 1
const DRAFT_STORE = 'cart_drafts'

class DraftStorageService {
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  constructor() {
    this.initPromise = this.initDB()
  }

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('IndexedDB not supported')
        reject(new Error('IndexedDB not supported'))
        return
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('IndexedDB failed to open:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result

        // Create cart_drafts object store
        if (!db.objectStoreNames.contains(DRAFT_STORE)) {
          const store = db.createObjectStore(DRAFT_STORE, { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('updatedAt', 'updatedAt', { unique: false })
          store.createIndex('name', 'name', { unique: false })
        }
      }
    })
  }

  /**
   * Ensure DB is initialized
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    await this.initPromise
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB')
    }

    return this.db
  }

  /**
   * Save a cart draft
   */
  public async saveDraft(draft: Omit<CartDraft, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DRAFT_STORE], 'readwrite')
      const store = transaction.objectStore(DRAFT_STORE)

      const now = new Date()
      const draftWithMeta: CartDraft = {
        ...draft,
        id: this.generateDraftId(),
        createdAt: now,
        updatedAt: now
      }

      const request = store.add(draftWithMeta)

      request.onsuccess = () => {
        resolve(draftWithMeta.id)
      }

      request.onerror = () => {
        console.error('Failed to save draft:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Update an existing draft
   */
  public async updateDraft(id: string, updates: Partial<CartDraft>): Promise<void> {
    const db = await this.ensureDB()

    const existing = await this.getDraft(id)
    if (!existing) {
      throw new Error('Draft not found')
    }

    return new Promise((resolve, reject) => {

      const transaction = db.transaction([DRAFT_STORE], 'readwrite')
      const store = transaction.objectStore(DRAFT_STORE)

      const updatedDraft: CartDraft = {
        ...existing,
        ...updates,
        id: existing.id, // Preserve ID
        createdAt: existing.createdAt, // Preserve creation date
        updatedAt: new Date()
      }

      const request = store.put(updatedDraft)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        console.error('Failed to update draft:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Get a specific draft by ID
   */
  public async getDraft(id: string): Promise<CartDraft | null> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DRAFT_STORE], 'readonly')
      const store = transaction.objectStore(DRAFT_STORE)
      const request = store.get(id)

      request.onsuccess = () => {
        const draft = request.result
        if (draft) {
          // Convert date strings back to Date objects
          draft.createdAt = new Date(draft.createdAt)
          draft.updatedAt = new Date(draft.updatedAt)
        }
        resolve(draft || null)
      }

      request.onerror = () => {
        console.error('Failed to get draft:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Get all drafts, sorted by update date (newest first)
   */
  public async getAllDrafts(): Promise<CartDraft[]> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DRAFT_STORE], 'readonly')
      const store = transaction.objectStore(DRAFT_STORE)
      const request = store.getAll()

      request.onsuccess = () => {
        const drafts = request.result.map((draft: any) => ({
          ...draft,
          createdAt: new Date(draft.createdAt),
          updatedAt: new Date(draft.updatedAt)
        }))

        // Sort by updatedAt descending
        drafts.sort((a: CartDraft, b: CartDraft) =>
          b.updatedAt.getTime() - a.updatedAt.getTime()
        )

        resolve(drafts)
      }

      request.onerror = () => {
        console.error('Failed to get all drafts:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Delete a draft
   */
  public async deleteDraft(id: string): Promise<void> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DRAFT_STORE], 'readwrite')
      const store = transaction.objectStore(DRAFT_STORE)
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        console.error('Failed to delete draft:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Delete all drafts
   */
  public async deleteAllDrafts(): Promise<void> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DRAFT_STORE], 'readwrite')
      const store = transaction.objectStore(DRAFT_STORE)
      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        console.error('Failed to delete all drafts:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Get draft count
   */
  public async getDraftCount(): Promise<number> {
    const db = await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DRAFT_STORE], 'readonly')
      const store = transaction.objectStore(DRAFT_STORE)
      const request = store.count()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        console.error('Failed to count drafts:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Get most recent draft
   */
  public async getMostRecentDraft(): Promise<CartDraft | null> {
    const drafts = await this.getAllDrafts()
    return drafts.length > 0 ? drafts[0] : null
  }

  /**
   * Delete old drafts (older than specified days)
   */
  public async deleteOldDrafts(daysOld: number = 7): Promise<number> {
    const drafts = await this.getAllDrafts()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const oldDrafts = drafts.filter(draft => draft.updatedAt < cutoffDate)

    for (const draft of oldDrafts) {
      await this.deleteDraft(draft.id)
    }

    return oldDrafts.length
  }

  /**
   * Generate unique draft ID
   */
  private generateDraftId(): string {
    return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Export drafts as JSON
   */
  public async exportDrafts(): Promise<string> {
    const drafts = await this.getAllDrafts()
    return JSON.stringify(drafts, null, 2)
  }

  /**
   * Import drafts from JSON
   */
  public async importDrafts(jsonData: string): Promise<number> {
    try {
      const drafts = JSON.parse(jsonData) as CartDraft[]
      let imported = 0

      for (const draft of drafts) {
        try {
          await this.saveDraft({
            name: draft.name,
            items: draft.items,
            customerName: draft.customerName,
            customerPhone: draft.customerPhone,
            paymentMethod: draft.paymentMethod,
            subtotal: draft.subtotal,
            tax: draft.tax,
            total: draft.total,
            itemCount: draft.itemCount
          })
          imported++
        } catch (error) {
          console.error('Failed to import draft:', error)
        }
      }

      return imported
    } catch (error) {
      console.error('Failed to parse draft JSON:', error)
      throw new Error('Invalid draft data')
    }
  }
}

// Create singleton instance
export const draftStorage = new DraftStorageService()

export default draftStorage
