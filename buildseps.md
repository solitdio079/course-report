# Actionable Development Requirements

## 1. Build user roles and permissions

Create the following roles:
- Admin
- Teacher
- Social Relations Manager
- Accountant
- Parent

Each user must log in and only access the features allowed for their role.

## 2. Build authentication

Users must be able to:
- Sign up
- Log in
- Log out
- Reset password
- Update profile information

Parents must be able to create an account and create a child profile.

## 3. Build student profiles

Create a student profile system with:
- First name
- Last name
- Date of birth
- Address
- Course email
- Parent information
- Parent phone number
- Linked courses
- Linked teachers

Parents should be able to create and edit their child’s profile.

## 4. Build course management

Create courses with:
- Course name
- Description
- Assigned teacher
- Enrolled students

Teachers should be able to view students assigned to their courses.

## 5. Build teacher section

Teachers must be able to:
- Select a student
- Select a course
- Add course comments
- Add points/grades
- Add progress assessments
- Save evaluations
- Generate a student report
- Include charts in the report
- Send the report to the shared inbox

## 6. Build report generation

The system must generate reports containing:
- Student information
- Course comments
- Points/grades
- Progress assessments
- Charts showing student performance
- Date of generation
- Author of the report

Reports should be downloadable as PDF.

## 7. Build inbox system

Create two inbox types:
- Individual inbox
- Shared inbox

Each role should have an individual inbox.

The shared inbox should be accessible by:
- Teachers
- Social Relations Managers
- Accountants
- Admins

Users should be able to:
- Send messages
- Attach reports
- View messages
- Mark messages as read
- Search messages

## 8. Build social relations section

The Social Relations Manager must be able to:
- View student profiles
- View parent contact information
- View teacher reports from the shared inbox
- Create social reports
- Upload/send social reports to the shared inbox

## 9. Build accounting section

The Accountant must be able to:
- View student profiles
- View parent contact information
- Add payments
- Add expenses
- Track who has paid
- Track who has not paid
- Mark payments as paid, pending, or overdue
- Send payment reminders to parents

## 10. Build payment management

Create payment records with:
- Student
- Parent
- Amount
- Due date
- Paid date
- Status
- Notes

Payment statuses:
- Pending
- Paid
- Overdue
- Cancelled

## 11. Build expense management

Create expense records with:
- Title
- Amount
- Date
- Description
- Created by

Accountants and admins should manage expenses.

## 12. Build parent section

Parents must be able to:
- Create a child profile
- View their child’s profile
- Receive notifications
- Receive payment reminders
- View reports related to their child

## 13. Build notification system

Notifications should support:
- General reminders
- Payment reminders
- New report alerts
- System messages

Notifications should include:
- Recipient
- Title
- Message
- Read/unread status
- Created date

## 14. Build dashboards

Create dashboards for each role.

Teacher dashboard:
- Assigned students
- Recent evaluations
- Generate report button
- Shared inbox access

Social Relations dashboard:
- Student search
- Parent contact access
- Shared inbox access
- Create report button

Accounting dashboard:
- Paid students
- Unpaid students
- Expenses summary
- Payment reminder button

Parent dashboard:
- Child profile
- Notifications
- Payment reminders
- Reports

Admin dashboard:
- Manage users
- Manage roles
- Manage students
- Manage courses
- View all reports
- View all payments
- View all expenses

## 15. Build SEO homepage

Create a public homepage with:
- SEO title
- SEO meta description
- Platform description
- Call-to-action buttons
- Login button
- Parent signup button
- Responsive design

## 16. Suggested implementation order

1. Set up project structure
2. Create database schema
3. Create authentication
4. Create roles and permissions
5. Create student and parent models
6. Create course model
7. Create teacher evaluation system
8. Create report generation
9. Create inbox system
10. Create social relations section
11. Create accounting/payment section
12. Create parent dashboard
13. Create notifications
14. Create admin dashboard
15. Create SEO homepage
16. Test all user flows

## 17. Core user stories

### Teacher
As a teacher, I want to enter grades, comments, and progress notes for a student so that the platform can generate a report.

As a teacher, I want to send generated reports to the shared inbox so other departments can view them.

### Social Relations Manager
As a social relations manager, I want to view student and parent contact information so I can follow up with families.

As a social relations manager, I want to create and share reports so other departments can consult them.

### Accountant
As an accountant, I want to track student payments so I know who has paid and who has not.

As an accountant, I want to send reminders to parents when payments are missed.

### Parent
As a parent, I want to create my child’s profile so the school can manage their information.

As a parent, I want to receive notifications and reminders about my child.

### Admin
As an admin, I want to manage users, roles, students, courses, payments, and reports.