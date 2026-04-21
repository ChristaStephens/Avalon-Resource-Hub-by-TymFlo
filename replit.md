# Avalon Healing Center — Resource Hub

## Overview

A static React web app for Avalon Healing Center's community resource hub. The app reads data directly from Airtable (free tier) with 60-minute client-side caching to stay well under API limits.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **Frontend**: React + Vite (artifacts/avalon-resource-hub)
- **Database**: Airtable (free plan) — no backend server needed
- **Routing**: Wouter (hash-based, GitHub Pages compatible)

## Features

- **Public Resource Hub** (`/`) — search, filter by support type, filter by cost, filter by insurance acceptance
- **Staff Area** (`#/staff`) — password-protected form to add new resources directly to Airtable
- **Quick Exit** — red button that immediately navigates to weather.com
- **60-minute cache** — stores Airtable data in localStorage to minimize API calls
- **Avalon branding** — teal (#007267), charcoal (#3d3a36), Nunito Sans font

## Airtable Configuration

- **Base ID**: appR2hVQ5VgSob12J
- **Table ID**: tblDowngy9UNJQhYc (Main Resources Database)
- **PAT**: stored as VITE_AIRTABLE_PAT secret (read + write scopes)
- **Staff password**: stored as VITE_STAFF_PASSWORD env var (default: avalon2024)

## Environment Variables

| Variable | Type | Purpose |
|---|---|---|
| VITE_AIRTABLE_BASE_ID | env (shared) | Airtable base ID |
| VITE_AIRTABLE_TABLE_ID | env (shared) | Airtable table ID |
| VITE_STAFF_PASSWORD | env (shared) | Staff area password |
| VITE_AIRTABLE_PAT | secret | Airtable Personal Access Token |

## GitHub Pages Deployment

This app is designed to work on GitHub Pages as a static site. Build output goes to `dist/public`. Use hash-based routing (`#/staff`) which works without server-side routing support.

## Key Commands

- `pnpm --filter @workspace/avalon-resource-hub run dev` — run locally
- `pnpm --filter @workspace/avalon-resource-hub run build` — build for GitHub Pages
