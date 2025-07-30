# 🎬 Movie Mojo

> **Note:** All accounts must be approved by the admin before full access is granted.  
> For access requests, please contact **titav@titav.tech**

## Overview

**Movie Mojo** is a mobile-friendly web application designed to let friends or private groups:

- Create shared watchlists
- Track and rate movies together
- Add movies via **TMDB integration** or manual input
- Mark movies as "Watched" or "To Watch"
- Collaborate in real-time inside private groups

The app uses Supabase for authentication and database management, and TMDB for movie metadata and poster support.

---

## Features

- 🔐 Secure group access via unique join codes  
- 🧑‍🤝‍🧑 Support for multiple groups per user  
- 🔎 Search and select movies from **The Movie Database (TMDB)**  
- 📝 Manual movie entry option  
- ✅ Toggle movies as “Watched” or “To Watch”  
- 🗑 Delete movies from a group list  
- 📱 Fully responsive interface

---

## Screenshots

### Watch Groups Dashboard

![Group List View](./src/Screenshot%202025-07-30%20145640.png)

### Group Detail View

![Group Detail View](./src/Screenshot%202025-07-30%20145832.png)

---

## Getting Started

This app runs entirely in the browser using Supabase and TMDB. You can deploy it using GitHub Pages or any static web host.

1. Clone the repository
2. Set up your `.env.js` or inline environment values for:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `TMDB_API_KEY`
3. Deploy via GitHub Pages or serve locally with any static server (e.g., `live-server`)

---

## Account Approval Flow

Users can sign up freely, but **must be approved manually by the admin** before accessing group functionality.  
This helps ensure privacy for closed movie night circles and shared friend groups.

---

## Contact

For support, access requests, or questions:

📧 **titav@titav.tech**

---

## License

MIT License
