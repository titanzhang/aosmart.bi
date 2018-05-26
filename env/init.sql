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
        "cot": {
          "properties": {
            "shipping": { "type": "float" }
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

PUT report
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  },

  "mappings": {
    "doc": {
      "properties": {
        "type": { "type": "keyword" },
        "product": {
          "properties": {
            "sku": { "type": "keyword" },
            "quantity": { "type": "long" },
            "price": { "type": "float" },
            "cog": { "type": "float" }
          }
        },
        "order": {
          "properties": {
            "order_no": { "type": "keyword" },
            "site": { "type": "keyword" },
            "store": { "type": "keyword" },
            "amount_paid": { "type": "float" },
            "cot_shipping": { "type": "float" },
            "date": { "type": "date" }
          }
        }
      }
    }
  }

}
