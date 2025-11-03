FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the pre-built JAR from host
COPY build/libs/*.jar app.jar

EXPOSE 8761

ENTRYPOINT ["java", "-jar", "app.jar"]
