# Project Requirements Prompt (PRP)

## Project Working Title

CivicPulse

Alternative Names:

* CivicSphere
* CityVoice
* PublicEye
* ResolveHub
* Community Hero

Preferred Working Name:
CivicPulse – AI-Powered Hyperlocal Community Problem Solver

---

# One-Line Description

Build an AI-powered civic social network that enables citizens to report local problems, verify issues collectively, track resolutions transparently, and hold authorities accountable through community participation and intelligent automation.

---

# Problem Statement

Community issues such as potholes, water leakages, broken streetlights, waste management problems, damaged infrastructure, and civic concerns are usually reported in fragmented ways through social media or complaint portals.

Current problems:

* No centralized reporting platform
* Duplicate reports everywhere
* Difficult to track progress
* Lack of transparency
* Poor community participation
* No accountability metrics
* Citizens rarely know whether issues are actually resolved

The platform should transform civic issue reporting into a collaborative and transparent social experience.

---

# Vision

Create a purpose-built social platform where:

Citizens:

* Raise local issues
* Support existing issues
* Verify issues
* Track progress
* Participate in community discussions

Authorities:

* Receive issue reports
* Post progress updates
* Share evidence
* Resolve issues transparently

Communities:

* Collaborate
* Verify outcomes
* Build accountability
* Improve local governance

---

# Product Philosophy

Think:

Twitter/X
+
Google Maps
+
AI Issue Detection
+
Public Accountability Dashboard
+
Community Collaboration

This is NOT an entertainment social media platform.

This is a Civic Action Platform.

---

# Target Audience

Primary:

* Citizens
* Students
* Residents
* Local communities

Secondary:

* Municipal Corporations
* City Administrators
* Ward Officers
* Mayors
* MLAs
* Government Departments

Tertiary:

* NGOs
* Community Leaders
* Journalists
* Researchers

---

# Geographic Structure

Architecture should support:

Country
→ State
→ City
→ Authorities
→ Issues

For MVP:

Country:
India

Preloaded States:

* Maharashtra
* Delhi
* Karnataka
* Tamil Nadu
* Telangana

Preloaded Cities:

* Mumbai
* Delhi
* Bengaluru
* Chennai
* Hyderabad

Architecture should remain globally scalable.

---

# User Roles

## Citizen

Default role.

Permissions:

* Register
* Login
* Edit profile
* Raise issue reports
* Create civic discussions
* Support issues
* Confirm issues
* Comment
* Reshare
* Search
* View dashboards
* Track status
* Receive notifications

---

## Verified Authority

Examples:

* Prime Minister
* Chief Minister
* Mayor
* MLA
* Municipal Commissioner
* Ward Officer
* Department Officer

Permissions:

* Manage assigned issues
* Update issue statuses
* Upload progress photos
* Upload completion evidence
* Post updates
* View authority analytics
* Receive notifications

Verification:

User applies
→ Admin reviews
→ Verified badge assigned

---

## Admin

Permissions:

* Manage users
* Verify authorities
* Moderate content
* Remove spam
* Merge duplicate reports
* Manage locations
* Manage categories
* View platform analytics
* Manage test data
* Handle reports

---

# Authority Hierarchy

India

Prime Minister
↓
State
↓
Chief Minister
↓
City
↓
Mayor
↓
Municipal Commissioner
↓
Ward Officers
↓
Department Officers

Examples:

Road Department
Electricity Department
Water Supply Department
Waste Management Department

Every authority profile contains:

* Name
* Position
* Badge
* Jurisdiction
* Statistics
* Assigned issues
* Resolved issues
* Activity history

Future:

Historical authority records.

---

# Authentication

Registration:

Fields:

* Full Name
* Username
* Email
* Password
* Country
* State
* City

Authentication:

Preferred:
Firebase Authentication

Fallback:
Supabase Auth

---

# Onboarding

After registration:

Assign user to:

Country
State
City

Automatically subscribe them to their city feed and notifications.

No manual city following required.

---

# Core Navigation

Bottom Navigation (Mobile)

Home
Issues
Create
Search
Profile

Desktop Layout

Left Sidebar
Center Feed
Right Sidebar

---

# Landing Page

Purpose:
Explain platform mission.

Sections:

Hero Section
How It Works
Impact Statistics
Features
Future Vision
Authentication CTA

Hero Title:

Turn Community Problems Into Collective Action

Subtitle:

Report local issues, rally community support, and track resolutions transparently.

Buttons:

Raise an Issue
Explore Cities
Sign Up

---

# Homepage

Mixed social feed.

Displays:

Issue Reports
Civic Discussions
Trending Issues
Recent Resolutions
Authority Updates

Feed prioritization:

1. Same city
2. Same state
3. National trends

---

# Content Types

## Issue Reports

Purpose:

Raise physical civic problems.

Examples:

* Potholes
* Garbage
* Water Leakage
* Broken Roads
* Streetlight Issues
* Drainage Problems

Fields:

Images
Videos
Title
Description
Category
Location
Severity
Status
Support Count
Confirmation Count
Comments
Reshares
Timeline

---

## Civic Discussions

Purpose:

Community conversations.

Examples:

Suggestions
Opinions
Complaints
Awareness
Feedback

Fields:

Text
Images optional
Comments
Supports
Reshares

No lifecycle.

---

# Raise Issue Flow

Citizen
↓
Upload Image
↓
AI Analysis
↓
Location Detection
↓
Duplicate Check
↓
Category Assignment
↓
Severity Detection
↓
Responsible Authority Assignment
↓
Issue Created

---

# AI Features (MVP)

## AI Categorization

Detect:

* Pothole
* Garbage
* Water Leakage
* Broken Streetlight
* Damaged Infrastructure

Use pretrained open-source vision models.

No custom model training.

---

## AI Severity Analysis

Categories:

Low
Medium
High
Critical

Factors:

Image
Description
Object Size
Issue Context

---

## Duplicate Detection

Before posting:

Search:

Same category
Same city
Nearby location

Suggest:

Support Existing Issue
Or
Continue Creating New Issue

---

# Future AI Features

AI-generated image detection
Predictive analytics
Issue hotspot forecasting
Infrastructure risk prediction
Sentiment analysis
Automatic department routing
Smart notifications

---

# Issue Status Lifecycle

Submitted
↓
Community Verification Pending
↓
Community Verified
↓
Seen by Authority
↓
In Progress
↓
Resolved by Authority
↓
Awaiting Community Verification
↓
Community Verified Resolution
↓
Closed

---

# Community Verification Rules

Issue Confirmation:

Status:

Community Verification Pending

Button:

Confirm Issue Exists

MVP Threshold:

10 confirmations.

Once threshold reached:

Community Verified.

---

# Resolution Verification

Authority marks:

Resolved.

System status:

Awaiting Community Verification.

Button:

Confirm Resolved.

MVP Threshold:

10 confirmations.

Once threshold reached:

Closed.

---

# Authority Updates

Authority can update issue timeline.

Examples:

Inspection completed.
Repair crew assigned.
Road repair started.
Work completed.

Every update can contain:

Text
Images
Timestamp

All updates remain inside issue timeline.

---

# Engagement Actions

Support
Confirm
Comment
Reshare
Status

No traditional likes.

---

# Search System

Search:

Cities
States
Authorities
Citizens
Issues
Discussions

Filters:

Issue Category
Severity
Status
Location
Authority
Trending

Trending page includes:

Popular Issues
Popular Discussions
Hashtags
Cities

---

# City Pages

Every city has:

Overview
Issues
Discussions
Authorities
Statistics
Resolved Issues
Trending Problems

Statistics:

Open Issues
Resolved Issues
Critical Issues
Average Resolution Time
Most Common Categories

---

# Authority Pages

Profile:

Badge
Position
Jurisdiction
Assigned Issues
Resolved Issues
Response Time
Statistics

Tabs:

Posts
Issues
Updates
Analytics

---

# Citizen Profiles

Statistics:

Issues Raised
Issues Resolved
Supports Given
Confirmations
Contribution Score
City Rank

Tabs:

Posts
Issues
Discussions
Activity

---

# Dashboard Metrics

Platform:

Total Issues
Resolved Issues
Critical Issues
Cities Participating
Active Users

Country Dashboard:

Issues Nationwide
Top States
Resolution Rates

State Dashboard:

Issues
Cities
Departments
Performance

City Dashboard:

Issues
Resolution Time
Categories
Critical Problems

Authority Dashboard:

Assigned Issues
Resolved Issues
Pending Issues
Response Time

---

# Notification System

New issue in city
Issue status updated
Authority update posted
Issue confirmed
Issue resolved
Comment received
Reshare received
Verification request

---

# Database Structure

Users
Authorities
Countries
States
Cities
Departments
IssueReports
Discussions
Comments
Supports
Confirmations
Reshares
Notifications
IssueTimeline
IssueUpdates
Trending
MediaFiles
Reports
Analytics

---

# Seed Data

Preload:

Cities:
Mumbai
Delhi
Bengaluru
Chennai
Hyderabad

Authorities:
Sample PM
Sample CMs
Sample Mayors
Sample MLAs
Sample Officers

Citizens:
10–20 demo users.

Issues:
30–50 demo issues.

Add:

Comments
Supports
Confirmation counts
Timeline entries
Resolved issues

Purpose:

Application feels populated during hackathon demonstration.

---

# Design System

Theme:

Modern Civic Dashboard

Inspiration:

Twitter structure
LinkedIn professionalism
Notion cleanliness

Colors:

Primary Blue
Success Green
Warning Amber
Critical Red

Style:

Soft cards
Subtle glass effects
Rounded corners
Clean typography
Professional dashboards

---

# Future Scope

Citizen communities
Issue heatmaps
Geo-fencing notifications
Historical authority records
Government integrations
Predictive maintenance analytics
AI-generated image detection
Reward system
Contribution badges
Volunteer programs
Real-time emergency alerts
Public APIs
Open civic datasets

---

# Success Metrics

Number of issues raised
Resolution rate
Average resolution time
Community participation
Confirmation accuracy
Authority responsiveness
Citizen engagement
City health score

---

# Goal

Deliver a hackathon-ready MVP demonstrating how AI and community collaboration can make local governance more transparent, accountable, and efficient.
