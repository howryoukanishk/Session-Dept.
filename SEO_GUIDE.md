# session dept. - SEO Setup & Analytics Integration Guide

This guide details how to activate Google Analytics 4 (GA4) tracking and verify your website ownership in Google Search Console (GSC) using the built-in placeholders in the codebase.

---

## 1. Google Analytics 4 (GA4) Setup

Every HTML file in the repository contains a commented placeholder for the Google Tag (gtag.js) script in the `<head>` section:

```html
<!-- Google Analytics Placeholder. Insert GA4 tracking ID (e.g., G-XXXXXXXXXX) here. -->
<!-- 
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
-->
```

### Steps to Activate:
1. Log into your **Google Analytics Console** (https://analytics.google.com).
2. Create a new **GA4 Property** for `sessiondept.com`.
3. In the Property settings, navigate to **Data Streams** -> **Web** and copy your **Measurement ID** (format: `G-XXXXXXXXXX`).
4. Open all HTML files in this project:
   - `index.html`
   - `about.html`
   - `philosophy.html`
   - `journal.html`
   - `contact.html`
   - `faq.html`
5. Uncomment the script tags in each file and replace `G-XXXXXXXXXX` with your actual Measurement ID.
6. Commit and push the updated files to your repository.

---

## 2. Google Search Console (GSC) Verification

Every HTML file also contains a verification placeholder in the `<head>` meta tags:

```html
<meta name="google-site-verification" content="YOUR_GSC_VERIFICATION_TOKEN_HERE">
```

### Steps to Verify:
1. Open the **Google Search Console** (https://search.google.com/search-console).
2. Click **Add Property** and select the **URL prefix** option. Enter `https://sessiondept.com/`.
3. Under the verification options, choose **HTML tag** (do *not* choose HTML file upload, as editing the meta tag is cleaner).
4. Copy the unique verification token string from the content attribute shown (e.g. `google-site-verification` content value).
5. Open your HTML files and replace `YOUR_GSC_VERIFICATION_TOKEN_HERE` with the token.
6. Deploy the changes to your hosting provider or GitHub Pages.
7. Return to Google Search Console and click **Verify**.

---

## 3. Crawl Status & Sitemap Submission

We have already configured a static `sitemap.xml` and `robots.txt` in the root of the project.

### Steps to submit your Sitemap:
1. Once GSC verification succeeds, click on **Sitemaps** in the left sidebar menu of Search Console.
2. In the "Add a new sitemap" input field, enter `sitemap.xml`.
3. Click **Submit**. Google will read the sitemap file and verify indexing status daily.
