# Data Onboarding Pipeline API

A scalable NestJS-based data onboarding API that accepts customer data (sites and buildings), validates it, publishes to Kafka topics, and asynchronously processes the data into a PostgreSQL database with real-time status tracking.

## Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌───────────┐      ┌──────────────┐      ┌────────────┐
│   Client    │─────▶│ REST API     │─────▶│   Kafka   │─────▶│   Consumer   │─────▶│ PostgreSQL │
│             │      │ (Validation) │      │  Topics   │      │   Service    │      │            │
└─────────────┘      └──────────────┘      └───────────┘      └──────────────┘      └────────────┘
                            │                                          │
                            │                                          │
                            └──────────────┬───────────────────────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │ Status Tracking │
                                  └─────────────────┘
```

### Components

1. **REST API**: Accepts and validates site/building data
2. **Kafka Producer**: Publishes validated data to appropriate topics
3. **Kafka Consumer**: Listens to topics and processes data
4. **PostgreSQL Database**: Stores sites, buildings, and onboarding requests
5. **Status Tracking**: Monitors the progress of each onboarding request

## Features

- RESTful API endpoints for data onboarding
- Schema-based validation using class-validator
- Asynchronous processing with Kafka
- Real-time status tracking of onboarding requests
- PostgreSQL for reliable data storage
- Docker Compose for easy local development
- TypeORM for database management

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd data-onboarding-pipeline
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file if needed to customize configuration.

## Running the Application

### Start Infrastructure Services

Start PostgreSQL, Kafka, and Zookeeper using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port `5432`
- Kafka on port `9092`
- Zookeeper on port `2181`
- Kafka UI on port `8080` (accessible at http://localhost:8080)

### Start the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Onboard a Site

**POST** `/onboarding/site`

Submit a new site for onboarding.

**Request Body:**
```json
{
  "name": "Main Campus",
  "address": "123 Main Street",
  "city": "San Francisco",
  "state": "CA",
  "zipCode": "94102",
  "country": "USA",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "metadata": {
    "type": "campus",
    "capacity": 5000
  }
}
```

**Response (202 Accepted):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "entityType": "SITE",
  "status": "VALIDATED",
  "message": "Site onboarding request submitted successfully",
  "createdAt": "2025-11-15T10:30:00.000Z"
}
```

### Onboard a Building

**POST** `/onboarding/building`

Submit a new building for onboarding.

**Request Body:**
```json
{
  "name": "Building A",
  "buildingType": "Office",
  "floors": 10,
  "squareFootage": 50000,
  "constructionDate": "2020-01-15",
  "siteId": "550e8400-e29b-41d4-a716-446655440000",
  "metadata": {
    "hasParking": true,
    "parkingSpaces": 200
  }
}
```

**Response (202 Accepted):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "entityType": "BUILDING",
  "status": "VALIDATED",
  "message": "Building onboarding request submitted successfully",
  "createdAt": "2025-11-15T10:35:00.000Z"
}
```

### Get Onboarding Status

**GET** `/onboarding/status/:requestId`

Get the current status of an onboarding request.

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "entityType": "SITE",
  "status": "COMPLETED",
  "data": { ... },
  "errorMessage": null,
  "entityId": "770e8400-e29b-41d4-a716-446655440002",
  "createdAt": "2025-11-15T10:30:00.000Z",
  "updatedAt": "2025-11-15T10:30:05.000Z"
}
```

### Get All Onboarding Requests

**GET** `/onboarding/requests`

Get all onboarding requests ordered by creation date.

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "entityType": "SITE",
    "status": "COMPLETED",
    "data": { ... },
    "errorMessage": null,
    "entityId": "770e8400-e29b-41d4-a716-446655440002",
    "createdAt": "2025-11-15T10:30:00.000Z",
    "updatedAt": "2025-11-15T10:30:05.000Z"
  }
]
```

## Onboarding Status Flow

The onboarding process follows these statuses:

1. **PENDING**: Initial state when request is created
2. **VALIDATING**: Data is being validated
3. **VALIDATED**: Data validation successful, sent to Kafka
4. **PROCESSING**: Consumer is processing the data
5. **COMPLETED**: Entity successfully created in database
6. **FAILED**: An error occurred during processing

## Data Models

### Site

- `id`: UUID (auto-generated)
- `name`: string (required, unique)
- `address`: string (required)
- `city`: string (optional)
- `state`: string (optional)
- `zipCode`: string (optional)
- `country`: string (optional)
- `latitude`: number (optional)
- `longitude`: number (optional)
- `metadata`: JSON object (optional)
- `createdAt`: timestamp
- `updatedAt`: timestamp

### Building

- `id`: UUID (auto-generated)
- `name`: string (required)
- `buildingType`: string (optional)
- `floors`: number (optional)
- `squareFootage`: number (optional)
- `constructionDate`: date (optional)
- `siteId`: UUID (optional, foreign key to Site)
- `metadata`: JSON object (optional)
- `createdAt`: timestamp
- `updatedAt`: timestamp

### OnboardingRequest

- `id`: UUID (auto-generated)
- `entityType`: enum (SITE, BUILDING)
- `status`: enum (PENDING, VALIDATING, VALIDATED, PROCESSING, COMPLETED, FAILED)
- `data`: JSON object
- `errorMessage`: string (nullable)
- `entityId`: UUID (nullable, references the created entity)
- `createdAt`: timestamp
- `updatedAt`: timestamp

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_DATABASE` | PostgreSQL database name | `data_onboarding` |
| `KAFKA_CLIENT_ID` | Kafka client ID | `data-onboarding-api` |
| `KAFKA_BROKERS` | Kafka broker addresses | `localhost:9092` |
| `KAFKA_CONSUMER_GROUP` | Kafka consumer group | `data-onboarding-consumer` |
| `KAFKA_SITE_TOPIC` | Kafka topic for sites | `site-onboarding` |
| `KAFKA_BUILDING_TOPIC` | Kafka topic for buildings | `building-onboarding` |

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Example Usage

### Using curl

```bash
# Onboard a site
curl -X POST http://localhost:3000/onboarding/site \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Office",
    "address": "456 Market St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "country": "USA"
  }'

# Check status
curl http://localhost:3000/onboarding/status/{requestId}

# Get all requests
curl http://localhost:3000/onboarding/requests
```

### Using HTTPie

```bash
# Onboard a building
http POST http://localhost:3000/onboarding/building \
  name="Building B" \
  buildingType="Warehouse" \
  floors:=5 \
  squareFootage:=30000
```

## Monitoring

### Kafka UI

Access Kafka UI at http://localhost:8080 to:
- View topics and messages
- Monitor consumer groups
- Inspect message payloads

### Database

Connect to PostgreSQL to view data:

```bash
docker exec -it data-onboarding-postgres psql -U postgres -d data_onboarding
```

## Project Structure

```
src/
├── entities/              # TypeORM entities
│   ├── site.entity.ts
│   ├── building.entity.ts
│   └── onboarding-request.entity.ts
├── dto/                   # Data Transfer Objects with validation
│   ├── create-site.dto.ts
│   ├── create-building.dto.ts
│   └── onboarding-response.dto.ts
├── kafka/                 # Kafka producer and consumer
│   ├── kafka-producer.service.ts
│   ├── kafka-consumer.service.ts
│   └── kafka.module.ts
├── onboarding/           # Onboarding API
│   ├── onboarding.controller.ts
│   ├── onboarding.service.ts
│   └── onboarding.module.ts
├── app.module.ts         # Root module
└── main.ts               # Application entry point
```

## Troubleshooting

### Kafka Connection Issues

If you see Kafka connection errors:
1. Ensure Docker containers are running: `docker-compose ps`
2. Check Kafka logs: `docker-compose logs kafka`
3. Verify broker is ready: `docker-compose logs kafka | grep "started"`

### Database Connection Issues

1. Check PostgreSQL is running: `docker-compose ps postgres`
2. Verify credentials in `.env` file
3. Test connection: `docker exec -it data-onboarding-postgres psql -U postgres`

## Cleanup

Stop and remove all containers:

```bash
docker-compose down

# Remove volumes (deletes all data)
docker-compose down -v
```

## License

This project is licensed under the MIT License.
