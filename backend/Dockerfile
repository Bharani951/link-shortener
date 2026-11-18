# ---- Stage 1: build the jar (needs the full JDK) ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy only what's needed to download dependencies first.
# Docker caches this step, so dependencies download again only when pom.xml changes.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
# sed removes Windows line endings (CRLF) from mvnw; without it Linux can't run the script
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw -q dependency:go-offline

COPY src/ src/
RUN ./mvnw -q package -DskipTests

# ---- Stage 2: run it (only the small JRE + the jar) ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]