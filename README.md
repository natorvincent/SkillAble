# SkillAble
## About SkillAble
SkillAble is a responsive web application designed to help users explore and enhance their skills through interactive features and modern UI components.


## Features
- Interactive Lessons: Engaging, animated mini-games (drag-and-drop, sorting, step-based tasks) that teach practical skills (laundry, cooking, hygiene, household chores).
- Multi‑Level Modules:  Lessons organized into progressive difficulty levels so learners advance through sequenced tasks.
- Progress Tracking & Persistence:   Save and retrieve student lesson progress with services to persist scores and completion status.
- Student Dashboard: Personalized student view of active lessons, progress summaries, and earned achievements.
- Teacher Dashboard & Management:   Tools for teachers to view student progress, set difficulties, and track class performance.
- Admin Interface:  Administrative controls for promoting/demoting users, managing modules and lessons, and viewing overall system state.
- Badges & Achievements:  Visual rewards and badges to motivate learners when they complete lessons or milestones.

## Technology Stack  
### Frontend
- React:** 19.1.0 (`react`, `react-dom`)
- React Scripts:** 5.0.1 (`react-scripts`)
- React Router DOM:** 7.9.3 (`react-router-dom`)
- Material UI:** @mui/material 7.3.3, @mui/icons-material 7.1.1
- Styled Components:** 6.1.19 (`styled-components`)
- Framer Motion:** 12.12.1 (`framer-motion`)
- Axios:** 1.9.0 (`axios`)
- Testing Libraries:** @testing-library/react 16.3.0, @testing-library/jest-dom 6.6.3
- Other notable deps:** `react-dnd` 16.0.1, `react-dnd-html5-backend` 16.0.1, `use-sound` 5.0.0, `react-icons` 5.5.0, `react-lottie` 1.2.10
> Note: The dependency versions above are sourced from `package.json` in this repository. The project was developed with Create React App tooling (`react-scripts`) and targets modern browsers.

Recommended runtime:
- Node.js:** use a current LTS (Node 18.x or 20.x recommended). Ensure `npm` or `yarn` is available.

### Prerequisites
- Node.js (LTS) installed (18.x or 20.x recommended)
- npm (comes with Node) or Yarn

### Backend: 

##### Programming Language:
- Java v17
##### Framework:
- Spring Boot v3.3.11
##### Backend Modules:
- Spring Web v3.3.11
- Spring Data JPA v3.3.11
- Spring Security v3.3.11
- Spring Validation v3.3.11
##### Database:
- MySQL Server v8.x
- MySQL Connector/J v8.4.x (managed by Spring Boot)
##### Build Tool:
- Apache Maven
- Maven Compiler Plugin v3.11.0
#### Utilities:
- Lombok v1.18.30
#### Server:
- Embedded Apache Tomcat
#### Connection Pool:
- HikariCP


## Getting Started
### Clone frontend Repository
```bash
git clone -b frontend https://github.com/natorvincent/SkillAble.git
```

### Clone backend Repository
```bash
git clone -b backend https://github.com/natorvincent/SkillAble.git
```
### Database
- Make sure the database is already imported 

## Set up & Running
### Prerequisites 
- IDE
- Database
- Node
  
cd skillable

npm install
npm install material-ui
npm install node.js
