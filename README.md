# envguard

Lightweight utility to validate and diff `.env` files across environments.

---

## Installation

```bash
npm install envguard
# or
npm install -g envguard
```

---

## Usage

```js
import { validate, diff } from 'envguard';

// Validate that all keys in .env.example exist in .env
const result = validate({
  template: '.env.example',
  target: '.env',
});

if (!result.valid) {
  console.error('Missing keys:', result.missing);
}

// Diff two environment files
const changes = diff('.env.staging', '.env.production');
console.log(changes);
// { added: ['NEW_API_URL'], removed: ['OLD_KEY'], changed: ['DB_HOST'] }
```

### CLI

```bash
envguard validate --template .env.example --target .env
envguard diff .env.staging .env.production
```

---

## Why envguard?

- ✅ Catch missing environment variables before deployment
- 🔍 Spot differences between environment configs at a glance
- ⚡ Zero dependencies, minimal footprint

---

## Contributing

Pull requests are welcome. Please open an issue first to discuss any significant changes.

---

## License

[MIT](LICENSE)