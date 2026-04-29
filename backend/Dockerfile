# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy the pom.xml and download dependencies
# This is done first so dependencies are cached in Docker layers
COPY pom.xml .
# (Optional) If you have a settings.xml, copy it here
RUN mvn dependency:go-offline -B

# Copy the actual source code and build it
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create the uploads directory so the application doesn't fail on startup
RUN mkdir -p uploads/student-docs

# Copy the built jar from the build stage
COPY --from=build /app/target/hms-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose the standard Spring Boot port
EXPOSE 8080

# Environment variables that Render will pass in:
# - DB_URL
# - DB_USERNAME
# - DB_PASSWORD
# - JWT_SECRET
# - HMS_UPLOADS_DIR

# Start the application
ENTRYPOINT ["sh","-c","java -jar app.jar --server.port=${PORT}"]
