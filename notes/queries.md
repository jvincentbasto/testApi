# Postman Queries

```json

// users
{
    "name": "test1",
    "email": "test1@gmail.com",
    "password": "testing123"
}

// customers
{
    "name": "customer1",
    "email": "customer1@gmail.com",
    "address": "123 Customer Street"
}

// products
{
    "name": "product 1",
    "description": "my product 1"
}

// productVariants
{
    "product": "6989932a492c1263aef8c8d3", // product id
    "sku": "SKU1", // Stock Keeping Unit
    "stock": 1000,
    "price": 100,
    "color": "blue"
}

// sales
{
    "customer": "6989f0407a838824c30a6c6e",
    "items": [
        {
            "product": "6989f0407a838824c30a6c8c", // product variant id
            "qty": 10
        },
        {
            "product": "6989f0407a838824c30a6c77",
            "qty": 10
        }
    ]
}

// date formats
{
    "startDate": "2026-02-15", // year-month-day
    "startDate": "2026-02-01T00:00:00.000Z",
    "endDate": "2026-02-15T23:59:59.999Z",
    "startDate": "1706745600000" // timestamps
}

// sales reports by calendar
// yearly
{
    "customer": "6989f0407a838824c30a6c6e",
    "products": [
        "6989f0407a838824c30a6c8c",
        "6989f0407a838824c30a6c77"
    ],
    "year": 2026
}
// monthly
{
    "customer": "6989f0407a838824c30a6c6e",
    "products": [
        "6989f0407a838824c30a6c8c",
        "6989f0407a838824c30a6c77"
    ],
    "year": 2026,
    "month": 6
}
// weekly
{
    "customer": "6989f0407a838824c30a6c6e",
    "products": [
        "6989f0407a838824c30a6c8c",
        "6989f0407a838824c30a6c77"
    ],
    "year": 2026,
    "week": 20
}


// sales reports by filter
// by-range
{
    "customer": "6989f0407a838824c30a6c6e",
    "products": [
        "6989f0407a838824c30a6c8c",
        "6989f0407a838824c30a6c77"
    ],
    "startDate": "2026-02-15",
    "endDate": "2026-02-25T23:59:59.999Z"
}
// by-backtracing
{
    "customer": "6989f0407a838824c30a6c6e",
    "products": [
        "6989f0407a838824c30a6c8c",
        "6989f0407a838824c30a6c77"
    ],
    "year": 1, // 1yr
    "month": 6, // 6mo
    "week": 20, // 20w
    "day": 12, // 12d
    "startDate": "2026-02-15"
    // "startDate": "2026-02-15T00:00:00.000Z"
}

// sales reports by use cases
{
    "customer": "6989f0407a838824c30a6c6e",
    "products": [
        "6989f0407a838824c30a6c8c",
        "6989f0407a838824c30a6c77"
    ],
    // 1st prio | by-range
    "startDate": "2026-02-15",
    "endDate": "2026-02-25T23:59:59.999Z",
    // 2nd prio | calendar-based
    "year": 2026,
    "month": 6,
    "week": 20,
    // default | by-backtracing
    "backtrackYear": 1,
    "backtrackMonth": 6,
    "backtrackWeek": 20,
    "backtrackDay": 12,
    "backtrackStartDate": "2026-02-15"
    // "backtrackStartDate": "2026-02-15T00:00:00.000Z"
}
```
