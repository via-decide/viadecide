---
title: "Physical Keys and Aporaksha NFC Authentication"
title_hi: "Physical Keys and Aporaksha NFC Authentication"
excerpt: "Local-first security cannot rely on third-party SaaS auth providers like Auth0 or Firebase. If internet connectivity is interrupted, users would be locked ..."
excerpt_hi: "स्थानीय-प्रथम सुरक्षा cannot rely on third-party SaaS auth providers like Auth0 or Firebase. If internet connectivity is interrupted, users would be locked ..."
category: "article"
icon: "📄"
date: 2026-06-08
readTime: 1
featured: false
---

# Physical Keys and Aporaksha NFC Authentication

Local-first security cannot rely on third-party SaaS auth providers like Auth0 or Firebase. If internet connectivity is interrupted, users would be locked out of their own systems. Zayvora integrates with Aporaksha, utilizing physical NFC keys to authorize critical operations.

Tapping a physical NFC key on the workstation reader releases a cryptographically signed payload. The local workstation validates the signature against an on-device registry of public keys. This unlocks specific seeds from Zayvora's Authority Deck, injecting them directly into the workstation memory.

This provides absolute physical authority over execution. Remote attackers cannot execute modifications because they lack the physical NFC token required to sign the gateway session, establishing a true air-gapped authentication boundary.

Built using: LogicHub · Aporaksha · Daxini · Zayvora
