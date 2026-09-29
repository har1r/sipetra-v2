# Dokumentasi Aturan Skema Validasi Zod

Dokumen ini berisi rincian aturan validasi skema Zod untuk setiap `ApplicationType`, mencakup batas jumlah data (array validation) pada **ComplementaryData** dan **RequestedData**, serta status mandatory/optional untuk setiap *field* detailnya.

---

## 1. Aturan Umum (Array Level)

Tabel berikut menentukan keberadaan (wajib/opsional) dan jumlah elemen minimum/maksimum dari array `ComplementaryData` dan `RequestedData` berdasarkan `ApplicationType`.

| Application Type | Complementary Data | Requested Data |
| :--- | :--- | :--- |
| **PARTIAL MUTATION** | Wajib dan $= 1$ | Wajib dan $\ge 1$ |
| **EXPIRED UPDATE** | Wajib dan $= 1$ | Wajib dan $= 1$ |
| **EXPIRED REGULAR** | Wajib dan $= 1$ | Wajib dan $= 1$ |
| **NEW TAX OBJECT** | Opsional | Wajib dan $= 1$ |
| **CORRECTION** | Wajib dan $= 1$ | Wajib dan $= 1$ |
| **REACTIVATION** | Opsional | Wajib dan $= 1$ |
| **MERGER MUTATION** | Wajib dan $\ge 2$ | Wajib dan $= 1$ |
| **MERGER AND PARTIAL MUTATION** | Wajib dan $\ge 2$ | Wajib dan $\ge 2$ |

---

## 2. Rincian Aturan Detail Per Field

Berikut adalah spesifikasi status keterisian (*Wajib* atau *Opsional*) untuk setiap *field* di dalam **ComplementaryData** dan **RequestedData**.

### A. Complementary Data

#### 1. TaxSubjectData
| Field Name | PARTIAL MUTATION | EXPIRED UPDATE | EXPIRED REGULAR | NEW TAX OBJECT | CORRECTION | REACTIVATION | MERGER MUTATION | MERGER AND PARTIAL MUTATION |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **name** | Wajib | Wajib | Wajib | Opsional | Wajib | Opsional | Wajib | Wajib |
| **whatsappNumber** | Opsional | Opsional | Opsional | Opsional | Opsional | Opsional | Opsional | Opsional |
| **address** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **block** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **neighborhoodUnit** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **communityUnit** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **subdistrict** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **village** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |

#### 2. TaxObjectData
| Field Name | PARTIAL MUTATION | EXPIRED UPDATE | EXPIRED REGULAR | NEW TAX OBJECT | CORRECTION | REACTIVATION | MERGER MUTATION | MERGER AND PARTIAL MUTATION |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **nop** | Wajib | Wajib | Wajib | Opsional | Wajib | Opsional | Wajib | Wajib |
| **nopTemporary** | Opsional | Opsional | Opsional | Opsional | Opsional | Opsional | Opsional | Opsional |
| **address** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **block** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **neighborhoodUnit** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **communityUnit** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **subdistrict** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **village** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **landArea** | Wajib | Wajib | Wajib | Opsional | Wajib | Opsional | Wajib | Wajib |
| **buildingArea** | Wajib | Wajib | Wajib | Opsional | Wajib | Opsional | Wajib | Wajib |
| **certificate** | Opsional | Opsional | Opsional | Opsional | Opsional | Opsional | Opsional | Opsional |

---

### B. Requested Data

#### 1. TaxSubjectData
| Field Name | PARTIAL MUTATION | EXPIRED UPDATE | EXPIRED REGULAR | NEW TAX OBJECT | CORRECTION | REACTIVATION | MERGER MUTATION | MERGER AND PARTIAL MUTATION |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **name** | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib |
| **whatsappNumber** | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib |
| **address** | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib |
| **block** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **neighborhoodUnit** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **communityUnit** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **subdistrict** | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib |
| **village** | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib |

#### 2. TaxObjectData
| Field Name | PARTIAL MUTATION | EXPIRED UPDATE | EXPIRED REGULAR | NEW TAX OBJECT | CORRECTION | REACTIVATION | MERGER MUTATION | MERGER AND PARTIAL MUTATION |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **nop** | Opsional | Opsional | Opsional | Opsional | Opsional | Opsional | Opsional | Opsional |
| **nopTemporary** | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib |
| **address** | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib |
| **block** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **neighborhoodUnit** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **communityUnit** | Opsional | Opsional | Opsional | Opsional | Wajib | Opsional | Opsional | Opsional |
| **subdistrict** | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib |
| **village** | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib |
| **landArea** | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib |
| **buildingArea** | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib |
| **certificate** | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib | Wajib |