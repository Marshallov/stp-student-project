FROM maven:3.9.16-eclipse-temurin-25 AS backend-build
WORKDIR /workspace
COPY pom.xml pom.xml
COPY src/main src/main
RUN mvn -B -ntp package -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=backend-build /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
