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
- Other notable dependencies:** `react-dnd` 16.0.1, `react-dnd-html5-backend` 16.0.1, `use-sound` 5.0.0, `react-icons` 5.5.0, `react-lottie` 1.2.10
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
- Node
#### Set up Steps
##### 1. Navigate to root directory :
```bash
cd skillable 
```
##### 2. Install dependencies : 
```bash
npm install
npm install material-ui or npm install @mui/material @emotion/react @emotion/styled
npm install node.js
```
### Running program
```bash
npm start
```
>Note: To run program to localhost, change the all of the API URL (https://skillable-pdv0.onrender.com) to http://localhost:8080.

## Backend Set up & Running
### Prerequisites
- IDE
- Java jdk (recommended version 17 + ) 
- Apache Maven (recommended version 3.6+)
- MySQL (recommended version 8.0+ )
- Database imported
### Application Properties Configuration
```bash
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/skillable_db
spring.datasource.username= (your database username)
spring.datasource.password= (your database password)
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# Server Configuration
server.port=8080
server.servlet.context-path=/api
```
### Common Issues and Resolutions
- Database Connectivity: Verify MySQL service status and user credentials.
- Port Conflict: Modify server.port or terminate existing process
- Dependency Issues: Execute mvn clean install -u
  
