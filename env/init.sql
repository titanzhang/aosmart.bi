PUT product
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  },

  "mappings": {
    "doc": {
      "properties": {
        "type": { "type": "keyword" },
        "sku": { "type": "keyword" },
        "name": { "type": "keyword" },
        "asin": { "type": "keyword" },
        "cog": {
          "type": "nested",
          "properties": {
            "amount": { "type": "float" },
            "effective_date": { "type": "date" }
          }
        }
      }
    }
  }
}

PUT order
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  },

  "mappings": {
    "doc": {
      "properties": {
        "type": { "type": "keyword" },
        "order_no": { "type": "keyword" },
        "buyer": {
          "properties": {
            "name": { "type": "text" },
            "street1": { "type": "keyword" },
            "street2": { "type": "keyword" },
            "city": { "type": "keyword" },
            "state": { "type": "keyword" },
            "country": { "type": "keyword" },
            "postal_code": { "type": "keyword" }
          }
        },
        "amount_paid": { "type": "float" },
        "cost_of_trans": {
          "type": "nested",
          "properties": {
            "cot_type": { "type": "byte" },
            "amount": { "type": "float" }
          }
        },
        "site": { "type": "keyword" },
        "store": { "type": "keyword" },
        "store_full": { "type": "keyword" },
        "products": {
          "type": "nested",
          "properties": {
            "sku": { "type": "keyword" },
            "quantity": { "type": "long" },
            "price": { "type": "float" },
            "cog": { "type": "float" }
          }
        },
        "date": { "type": "date" }
      }
    }
  }
}

PUT etl
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  },

  "mappings": {
    "doc": {
      "properties": {
        "type": { "type": "keyword" },
        "data": { "type": "keyword", "index": false },
        "date": { "type": "date" }
      }
    }
  }
}
