# Local-First AI Starter Kit — deployment contract

## R2 object layout

Bucket: `viadecide-r2`

```text
products/local-first-ai-starter-kit/
├── Local-First-AI-Starter-Kit.zip
└── preview/
    └── product-preview.pdf
```

The customer ZIP itself contains:

```text
Local-First-AI-Starter-Kit/
├── 01-Guide.pdf
├── 02-Decision-Checklist.pdf
├── 03-Tools-List.pdf
├── templates/
│   ├── config-example.yaml
│   └── workflow-template.md
└── README.txt
```

## Required Vercel environment variables

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `R2_ENDPOINT` — Cloudflare S3-compatible endpoint, e.g. `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET=viadecide-r2`

Do not put these values in source control.

## Delivery flow

`Sales page -> fixed-price server checkout -> Razorpay -> server-side signature + payment lookup -> 15-minute R2 presigned URL -> ZIP download`

The amount is fixed server-side at INR 499 (49900 paise). The client cannot choose the product price.

## Artifact integrity

Expected SHA-256 after upload:

- `Local-First-AI-Starter-Kit.zip`: `3dd74f95023c3dcc1674ea9bbabf77d5fba6da9089055d1ef1bbfcdf779a76ef`
- `preview/product-preview.pdf`: `abfd50227607eef6d17f8631f8edde2c65cbf579204d300a9c47a2e9d1fd5f8f`

After upload, verify the objects exist before merging/deploying. Then make one test purchase in Razorpay test mode before switching to live credentials.
