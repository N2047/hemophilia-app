# Hemophilia Factor Management App — Backup & Recovery Operational Guide

## १. अवलोकन (Overview)
यो निर्देशिका हेमोफिलिया फ्याक्टर व्यवस्थापन प्रणालीको डाटा सुरक्षा, नियमित ब्याकअप, डिजास्टर रिकभरी (Disaster Recovery) तथा डाटा पुनःप्राप्ति प्रक्रियाका लागि तयार गरिएको हो।

---

## २. नियमित ब्याकअप प्रक्रिया (Automated Backup)

### क. ब्याकअप फाइल निर्माण:
प्रणालीको डाटा, सबै ८ वटा कार्यालय, बिरामीहरूको अभिलेख, केन्द्रीय स्टक र वितरण रेकर्डहरू ब्याकअप गर्न निम्न कमाण्ड चलाउनुहोस्:

```bash
node scripts/backup.mjs
```

### ख. ब्याकअपका विशेषताहरू:
1. **Timestamped Naming:** प्रत्येक ब्याकअप फाइलको नाम मिति र समयसहित बन्छ (`hemo_backup_YYYY-MM-DDTHH-MM-SS.json`)।
2. **Cryptographic Checksum:** प्रत्येक फाइलको `SHA-256` ह्यास गणना भई `.sha256` फाइल बन्छ जसले डाटामा कुनै विकृति वा छेड़छाड़ (tampering) नभएको पुष्टि गर्छ।
3. **Transactional Consistency:** सबै तालिकाहरू (Tables) एकै समयमा ब्याकअप गरिन्छ।

---

## ३. डाटा पुनःप्राप्ति प्रक्रिया (Database Restoration)

कुनै प्राविधिक समस्या वा हार्डवेयर बिग्रिएको अवस्थामा ब्याकअपबाट डाटा पुनःप्राप्ति गर्न:

```bash
node scripts/restore.mjs <backup-file-name.json>
```

**उदाहरण:**
```bash
node scripts/restore.mjs hemo_backup_2026-10-13T03-14-07-413Z.json
```

**पुनःप्राप्ति सुरक्षा चरणहरू:**
- प्रणालीले पहिले `SHA-256` चेकसम रुजु गर्छ। चेकसम नमिलेमा पुनःप्राप्ति रोकिन्छ।
- डाटाबेस ट्रान्ज्याक्सनभित्र सुरक्षित रूपमा सबै मास्टर तथा बिरामी डाटा लोड गरिन्छ।

---

## ४. Production PostgreSQL Backup & Restore (PostgreSQL Deployment)

उत्पादन वातावरणमा PostgreSQL सर्भर प्रयोग गर्दा निम्न स्तरका ब्याकअप अपनाउन सकिन्छ:

### १. दैनिक pg_dump कमाण्ड (Cron Job):
```bash
# PostgreSQL Dump
pg_dump -h localhost -U postgres -d hemophilia_db -F c -b -v -f "/var/backups/hemophilia_$(date +\%Y\%m\%d_\%H\%M\%S).dump"
```

### २. Restore कमाण्ड:
```bash
pg_restore -h localhost -U postgres -d hemophilia_db -v "/var/backups/hemophilia_YYYYMMDD_HHMMSS.dump"
```

### ३. Point-In-Time Recovery (PITR):
- `postgresql.conf` मा WAL archiving (`archive_mode = on`, `archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'`) सक्रिय गर्नुहोस् जसले गर्दा कुनै पनि निश्चित सेकेन्डको अवस्थामा डाटा फिर्ता ल्याउन सकिन्छ।
