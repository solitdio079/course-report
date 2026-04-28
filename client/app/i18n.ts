import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const en = {
  // Navbar / common
  "nav.home": "Home",
  "nav.parent": "Parent",
  "nav.teacher": "Teacher",
  "nav.admin": "Admin",
  "nav.accounting": "Accounting",
  "nav.social": "Social",
  "nav.inbox": "Inbox",
  "nav.notifications": "Notifications",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.profile": "Profile",
  "nav.signIn": "Sign in",
  "nav.signUp": "Parent sign up",
  "nav.signOut": "Sign out",
  "nav.teacherPortal": "Teacher portal",
  "nav.teacherDashboard": "Teacher dashboard",
  "nav.teacherSignIn": "Teacher sign in",
  "nav.teacherSignUp": "Create teacher account",
  "language": "Language",

  // Common controls
  "common.back": "Back",
  "common.backHome": "Back to home",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.saving": "Saving...",
  "common.create": "Create",
  "common.creating": "Creating...",
  "common.update": "Update",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.send": "Send",
  "common.sending": "Sending...",
  "common.loading": "Loading...",
  "common.search": "Search...",
  "common.email": "Email",
  "common.password": "Password",
  "common.fullName": "Full name",
  "common.role": "Role",
  "common.actions": "Actions",
  "common.status": "Status",
  "common.amount": "Amount",
  "common.date": "Date",
  "common.notes": "Notes",
  "common.description": "Description",
  "common.title": "Title",
  "common.address": "Address",
  "common.phone": "Phone",
  "common.minChars": "Min {{n}} characters",
  "common.optional": "Optional",
  "common.yes": "Yes",
  "common.no": "No",
  "common.confirmDelete": "Are you sure?",
  "common.none": "—",

  // Roles
  "role.admin": "Admin",
  "role.teacher": "Teacher",
  "role.social_relations": "Social relations",
  "role.accountant": "Accountant",
  "role.parent": "Parent",

  // Home
  "home.heroBadge": "For schools, tutors & families",
  "home.heroTitle.before": "One platform for ",
  "home.heroTitle.highlight": "student success",
  "home.heroSubtitle":
    "Manage students, courses, evaluations and parent communication in one place. Generate beautiful PDF course reports and keep families in the loop.",
  "home.cta.signUp": "Get started — Parent sign up",
  "home.cta.signIn": "Log in",
  "home.cta.teacher.before": "Are you a teacher? ",
  "home.cta.teacher.link": "Sign in here",
  "home.stat.roles": "User roles",
  "home.stat.students": "Students",
  "home.stat.pdf": "Reports with charts",
  "home.stat.bilingual": "Bilingual interface",
  "home.features.title": "Everything you need",
  "home.features.subtitle":
    "Built for teachers, parents, social relations managers, accountants, and admins.",
  "home.feature.students.title": "Student profiles",
  "home.feature.students.text":
    "Centralize student information, parent contact details, and linked courses & teachers.",
  "home.feature.evaluations.title": "Course evaluations",
  "home.feature.evaluations.text":
    "Add comments, points, and progress assessments. Generate PDF reports with charts.",
  "home.feature.inbox.title": "Inbox & notifications",
  "home.feature.inbox.text":
    "Individual and shared inboxes for staff. Parents are automatically notified about new reports and payments.",
  "home.feature.payments.title": "Payment tracking",
  "home.feature.payments.text":
    "Manage payments, expenses, and send payment reminders to parents in one click.",
  "home.feature.roles.title": "Role-based access",
  "home.feature.roles.text":
    "Admin, teacher, social relations, accountant, and parent — each with the right tools.",
  "home.feature.pdf.title": "Beautiful PDF reports",
  "home.feature.pdf.text":
    "Branded, downloadable PDF reports with student information, charts, and progress notes.",
  "home.showcase.title": "From classroom to family — in one click",
  "home.showcase.text":
    "Teachers add evaluations, social-relations managers track wellbeing, accountants manage payments, and parents stay informed automatically. Everyone sees exactly what they need, nothing more.",
  "home.showcase.step1": "Teachers create evaluations and generate PDF reports.",
  "home.showcase.step2":
    "Parents receive in-app notifications the moment a report is ready.",
  "home.showcase.step3":
    "Accountants track payments and send reminders without leaving the platform.",
  "home.bottomCta.title": "Ready to streamline your school?",
  "home.bottomCta.subtitle":
    "Create a parent account in less than a minute, or sign in if you already have one.",
  "home.bottomCta.signUp": "Create parent account",

  // SEO
  "meta.home.title": "Course Report — Manage students, courses and reports",
  "meta.home.description":
    "Course Report is a complete platform for schools and tutors to manage students, courses, evaluations, payments, and parent communication.",
  "meta.about.title": "About — Course Report",
  "meta.about.description":
    "Course Report helps schools and tutors manage students, courses and parent communication in one platform.",
  "meta.contact.title": "Contact — Course Report",
  "meta.contact.description":
    "Get in touch with the Course Report team. Send a message, find our address, or reach us by email or phone.",

  // Footer
  "footer.tagline":
    "Manage students, courses and parent communication in one place.",
  "footer.platform": "Platform",
  "footer.account": "Account",
  "footer.legal": "Legal",
  "footer.terms": "Terms of use",
  "footer.privacy": "Privacy policy",
  "footer.cookies": "Cookie policy",
  "footer.rights": "All rights reserved.",

  // About page
  "about.badge": "About us",
  "about.heroTitle": "Built for the people who teach, support and raise students.",
  "about.heroText":
    "Course Report started with a simple question: why does it take so many tools, spreadsheets and chat threads to do something as important as letting parents know how their child is doing? We brought it all into one calm, focused platform.",
  "about.cta.parent": "Create parent account",
  "about.cta.contact": "Contact us",
  "about.mission.title": "Our mission",
  "about.mission.text":
    "We believe great education depends on great communication. Course Report helps schools and tutors run the operational side of teaching — evaluations, payments, parent updates — so educators can focus on what actually matters: the students in front of them.",
  "about.mission.b1.bold": "Clarity",
  "about.mission.b1.text":
    "every role sees a focused dashboard, not a maze of menus.",
  "about.mission.b2.bold": "Trust",
  "about.mission.b2.text":
    "clean audit trails for reports, payments, and messages.",
  "about.mission.b3.bold": "Inclusion",
  "about.mission.b3.text":
    "bilingual interface (EN/TR) and parent-first experience.",
  "about.values.title": "What we value",
  "about.values.subtitle": "Principles that guide every feature we ship.",
  "about.value1.title": "Calm software",
  "about.value1.text":
    "No noisy notifications, no dark patterns. Just the right info at the right time.",
  "about.value2.title": "Privacy by default",
  "about.value2.text":
    "Sensitive student data stays where it belongs. Role-based access, always.",
  "about.value3.title": "Built with educators",
  "about.value3.text":
    "Designed in collaboration with real teachers, social workers and parents.",
  "about.team.title": "The team",
  "about.team.subtitle": "A small group of people who care a lot about classrooms.",
  "about.team.aylin": "Co-founder, Product",
  "about.team.mehmet": "Co-founder, Engineering",
  "about.team.lara": "Education Lead",
  "about.cta2.title": "Want to know more?",
  "about.cta2.subtitle":
    "We'd love to hear about your school or tutoring business.",
  "about.cta2.contact": "Get in touch",

  // Contact page
  "contact.badge": "Contact",
  "contact.heroTitle": "We'd love to hear from you.",
  "contact.heroText":
    "Questions, partnership ideas, feedback or a school you'd like to onboard — drop us a note and we'll get back within one business day.",
  "contact.info.email": "Email",
  "contact.info.phone": "Phone",
  "contact.info.office": "Office",
  "contact.info.officeValue": "Levent, İstanbul, Türkiye",
  "contact.info.hours": "Hours",
  "contact.info.hoursValue": "Mon – Fri, 09:00 – 18:00 (UTC+3)",
  "contact.form.title": "Send us a message",
  "contact.form.note":
    "This form is a placeholder — email delivery isn't wired up yet. For now, please reach us via the email above.",
  "contact.form.success":
    "Thanks! Your message has been recorded locally. We'll wire up real delivery soon.",
  "contact.form.name": "Your name",
  "contact.form.email": "Email",
  "contact.form.subject": "Subject",
  "contact.form.message": "Message",
  "contact.form.consent":
    "By submitting, you agree to be contacted about your inquiry.",
  "contact.form.send": "Send message",
  "contact.where.title": "Where we are",
  "contact.where.text":
    "Visits are by appointment. Email us first and we'll set something up.",
  "contact.cta.title": "Ready to try it?",
  "contact.cta.subtitle": "Create a parent account in less than a minute.",

  // Sign in / Sign up (parent)
  "auth.signIn.title": "Welcome back",
  "auth.signIn.subtitle": "Sign in to your parent account.",
  "auth.signIn.submit": "Sign in",
  "auth.signIn.signingIn": "Signing in...",
  "auth.signIn.noAccount": "Don't have an account?",
  "auth.signIn.create": "Create one",
  "auth.signIn.forgot": "Forgot password?",
  "auth.signUp.title": "Create your parent account",
  "auth.signUp.subtitle":
    "Manage your child's profile and stay informed about their progress.",
  "auth.signUp.submit": "Create account",
  "auth.signUp.haveAccount": "Already have an account?",
  "auth.signUp.signIn": "Sign in",
  "auth.error.invalid": "Invalid input",
  "auth.error.signIn": "Could not sign in",
  "auth.error.signUp": "Unable to create account",

  // Teacher sign in / sign up
  "teacherAuth.signIn.title": "Teacher sign in",
  "teacherAuth.signIn.subtitle": "Sign in to your staff account.",
  "teacherAuth.signUp.title": "Staff accounts are admin-created",
  "teacherAuth.signUp.text":
    "Teacher, accountant, social relations, and admin accounts are created by an administrator. Please contact your admin to get an account, then sign in.",

  // Reset password
  "reset.title": "Reset your password",
  "reset.subtitle":
    "Enter your email and we'll send you a link to set a new password.",
  "reset.submit": "Send reset link",
  "reset.sent": "If that email exists, a reset link has been sent.",
  "reset.confirm.title": "Set a new password",
  "reset.confirm.subtitle": "Enter and confirm your new password.",
  "reset.confirm.new": "New password",
  "reset.confirm.repeat": "Repeat password",
  "reset.confirm.submit": "Update password",
  "reset.confirm.success": "Password updated. You can sign in now.",
  "reset.confirm.mismatch": "Passwords do not match",

  // Profile
  "profile.title": "Profile",
  "profile.update": "Update profile",
  "profile.changePassword": "Change password",
  "profile.currentPassword": "Current password",
  "profile.newPassword": "New password",
  "profile.saved": "Profile updated.",
  "profile.passwordUpdated": "Password updated.",

  // Notifications
  "notifications.title": "Notifications",
  "notifications.empty": "No notifications.",
  "notifications.markRead": "Mark read",
  "notifications.new": "new",

  // Parent dashboard
  "parent.title": "Welcome, {{name}}",
  "parent.children.title": "Your children",
  "parent.children.empty": "No children added yet.",
  "parent.notifications.title": "Notifications",
  "parent.notifications.viewAll": "View all",
  "parent.notifications.empty": "No notifications.",
  "parent.payments.title": "Payments",
  "parent.payments.empty": "No payments.",
  "parent.payments.due": "Due {{date}}",
  "parent.payments.paid": "Paid {{date}}",
  "parent.reports.title": "Reports about your children",
  "parent.reports.empty": "No reports yet.",
  "parent.reports.download": "Download",
  "parent.addChild.title": "Add a child profile",
  "parent.addChild.firstName": "First name",
  "parent.addChild.lastName": "Last name",
  "parent.addChild.dob": "Date of birth",
  "parent.addChild.address": "Address",
  "parent.addChild.courseEmail": "Course email",
  "parent.addChild.relationship": "Relationship",
  "parent.addChild.submit": "Add child",

  // Admin overview
  "admin.title": "Admin overview",
  "admin.users": "Users",
  "admin.reports": "Reports",
  "admin.expenses": "Expenses",
  "admin.payments": "Payments",
  "admin.expensesTotal": "Total {{amount}}",
  "admin.actions.users": "Manage users",
  "admin.actions.courses": "Manage courses",
  "admin.actions.reports": "All reports",
  "admin.actions.payments": "All payments",
  "admin.actions.expenses": "All expenses",

  // Admin users
  "adminUsers.title": "Users",
  "adminUsers.create.title": "Create staff user",
  "adminUsers.create.note":
    "Parents create their own accounts via sign-up. Use this form to create teachers, accountants, social relations managers, and other admins.",
  "adminUsers.create.password": "Password (min 8 chars)",
  "adminUsers.create.submit": "Create user",
  "adminUsers.create.success": "Created {{name}} ({{role}}).",
  "adminUsers.create.error": "Could not create user",
  "adminUsers.col.name": "Name",
  "adminUsers.col.email": "Email",
  "adminUsers.col.role": "Role",
  "adminUsers.col.created": "Created",

  // Admin reports
  "adminReports.title": "All reports",
  "adminReports.empty": "No reports.",

  // Accountant
  "acct.title": "Accounting",
  "acct.payments": "Payments",
  "acct.expenses": "Expenses",
  "acct.status.paid": "Paid",
  "acct.status.pending": "Pending",
  "acct.status.overdue": "Overdue",
  "acct.status.cancelled": "Cancelled",
  "acct.expensesSummary": "{{count}} expenses, total {{total}}",

  // Accountant payments
  "acctPayments.title": "Payments",
  "acctPayments.new": "New payment",
  "acctPayments.all": "All payments",
  "acctPayments.empty": "No payments.",
  "acctPayments.selectStudent": "Select student...",
  "acctPayments.dueDate": "Due date",
  "acctPayments.notesPh": "Notes (optional)",
  "acctPayments.add": "Add payment",
  "acctPayments.allStatuses": "All statuses",
  "acctPayments.searchStudent": "Search student...",
  "acctPayments.col.student": "Student",
  "acctPayments.col.parent": "Parent",
  "acctPayments.col.due": "Due",
  "acctPayments.col.paid": "Paid",
  "acctPayments.remind": "Remind",
  "acctPayments.remindSent": "Reminder sent to {{n}} parent(s).",
  "acctPayments.deleteConfirm": "Delete this payment?",

  // Accountant expenses
  "acctExp.title": "Expenses",
  "acctExp.totalSuffix": "Total {{amount}}",
  "acctExp.new": "New expense",
  "acctExp.add": "Add expense",
  "acctExp.empty": "No expenses.",
  "acctExp.col.title": "Title",
  "acctExp.col.author": "Author",
  "acctExp.col.description": "Description",
  "acctExp.deleteConfirm": "Delete this expense?",

  // Teacher dashboard
  "teacher.title": "Teacher dashboard",
  "teacher.students": "Students",
  "teacher.evaluations": "Evaluations",
  "teacher.newEvaluation": "New evaluation",
  "teacher.empty": "No students yet.",

  // Evaluations
  "eval.newTitle": "New evaluation",
  "eval.backTeacher": "Back to teacher dashboard",
  "eval.student": "Student",
  "eval.course": "Course",
  "eval.selectStudent": "Select student...",
  "eval.selectCourse": "Select course...",
  "eval.points": "Rating (1-5)",
  "eval.parameters": "Evaluation parameters",
  "eval.comment": "Course comment",
  "eval.progress": "Progress appreciation",
  "eval.progressShort": "Progress",
  "eval.progressPlaceholder": "e.g., strong improvement, struggling with...",
  "eval.save": "Save evaluation",
  "eval.add": "Add evaluation",
  "eval.empty": "No evaluations yet.",
  "eval.none": "No evaluations.",
  "eval.openStudent": "Open student",
  "eval.report.performance": "Rating chart",
  "eval.report.summary": "Monthly overview",
  "eval.report.timeline": "Evaluation timeline",
  "eval.report.average": "Average rating: {{rating}}/5 across {{count}} evaluation(s).",
  "eval.report.noRating": "No star ratings have been recorded for this month.",
  "eval.report.noComments": "No teacher comments have been recorded for this month.",
  "eval.report.commentOverview": "Comment overview",
  "eval.criteria.vocabulary": "Vocabulary",
  "eval.criteria.grammar": "Grammar",
  "eval.criteria.listening_comprehension": "Listening comprehension",
  "eval.criteria.reading_comprehension": "Reading comprehension",
  "eval.criteria.speaking": "Speaking",
  "eval.criteria.writing": "Writing",
  "eval.criteria.pronunciation": "Pronunciation",
  "eval.criteria.confidence": "Confidence",
  "eval.criteria.autonomy": "Autonomy",
  "eval.status.in_progress": "In progress",
  "eval.status.needs_work": "Needs work",
  "eval.status.priority": "Priority to strengthen",

  // Inbox
  "inbox.title": "Inbox",
  "inbox.individual": "Individual",
  "inbox.shared": "Shared",
  "inbox.compose": "Compose",
  "inbox.empty": "No messages.",
};

const tr = {
  // Navbar / common
  "nav.home": "Ana Sayfa",
  "nav.parent": "Veli",
  "nav.teacher": "Öğretmen",
  "nav.admin": "Yönetici",
  "nav.accounting": "Muhasebe",
  "nav.social": "Sosyal İlişkiler",
  "nav.inbox": "Gelen Kutusu",
  "nav.notifications": "Bildirimler",
  "nav.about": "Hakkımızda",
  "nav.contact": "İletişim",
  "nav.profile": "Profil",
  "nav.signIn": "Giriş Yap",
  "nav.signUp": "Veli Kaydı",
  "nav.signOut": "Çıkış Yap",
  "nav.teacherPortal": "Öğretmen Paneli",
  "nav.teacherDashboard": "Öğretmen Panosu",
  "nav.teacherSignIn": "Öğretmen Girişi",
  "nav.teacherSignUp": "Öğretmen Hesabı Oluştur",
  "language": "Dil",

  // Common
  "common.back": "Geri",
  "common.backHome": "Ana sayfaya dön",
  "common.cancel": "İptal",
  "common.save": "Kaydet",
  "common.saving": "Kaydediliyor...",
  "common.create": "Oluştur",
  "common.creating": "Oluşturuluyor...",
  "common.update": "Güncelle",
  "common.delete": "Sil",
  "common.edit": "Düzenle",
  "common.send": "Gönder",
  "common.sending": "Gönderiliyor...",
  "common.loading": "Yükleniyor...",
  "common.search": "Ara...",
  "common.email": "E-posta",
  "common.password": "Şifre",
  "common.fullName": "Ad Soyad",
  "common.role": "Rol",
  "common.actions": "İşlemler",
  "common.status": "Durum",
  "common.amount": "Tutar",
  "common.date": "Tarih",
  "common.notes": "Notlar",
  "common.description": "Açıklama",
  "common.title": "Başlık",
  "common.address": "Adres",
  "common.phone": "Telefon",
  "common.minChars": "En az {{n}} karakter",
  "common.optional": "İsteğe bağlı",
  "common.yes": "Evet",
  "common.no": "Hayır",
  "common.confirmDelete": "Emin misiniz?",
  "common.none": "—",

  // Roles
  "role.admin": "Yönetici",
  "role.teacher": "Öğretmen",
  "role.social_relations": "Sosyal İlişkiler",
  "role.accountant": "Muhasebeci",
  "role.parent": "Veli",

  // Home
  "home.heroBadge": "Okullar, eğitmenler ve aileler için",
  "home.heroTitle.before": "Öğrenci başarısı için ",
  "home.heroTitle.highlight": "tek platform",
  "home.heroSubtitle":
    "Öğrencileri, dersleri, değerlendirmeleri ve veli iletişimini tek yerde yönetin. Profesyonel PDF ders raporları oluşturun ve aileleri bilgilendirin.",
  "home.cta.signUp": "Hemen başla — Veli kaydı",
  "home.cta.signIn": "Giriş yap",
  "home.cta.teacher.before": "Öğretmen misiniz? ",
  "home.cta.teacher.link": "Buradan giriş yapın",
  "home.stat.roles": "Kullanıcı rolü",
  "home.stat.students": "Öğrenci",
  "home.stat.pdf": "Grafikli raporlar",
  "home.stat.bilingual": "İki dilli arayüz",
  "home.features.title": "İhtiyacınız olan her şey",
  "home.features.subtitle":
    "Öğretmenler, veliler, sosyal ilişkiler yöneticileri, muhasebeciler ve yöneticiler için tasarlandı.",
  "home.feature.students.title": "Öğrenci profilleri",
  "home.feature.students.text":
    "Öğrenci bilgilerini, veli iletişim bilgilerini ve bağlı ders & öğretmenleri tek yerde toplayın.",
  "home.feature.evaluations.title": "Ders değerlendirmeleri",
  "home.feature.evaluations.text":
    "Yorum, puan ve gelişim değerlendirmeleri ekleyin. Grafiklerle PDF raporlar oluşturun.",
  "home.feature.inbox.title": "Gelen kutusu ve bildirimler",
  "home.feature.inbox.text":
    "Personel için bireysel ve paylaşılan gelen kutuları. Veliler yeni raporlar ve ödemeler için otomatik olarak bilgilendirilir.",
  "home.feature.payments.title": "Ödeme takibi",
  "home.feature.payments.text":
    "Ödemeleri ve giderleri yönetin, velilere tek tıkla ödeme hatırlatması gönderin.",
  "home.feature.roles.title": "Rol tabanlı erişim",
  "home.feature.roles.text":
    "Yönetici, öğretmen, sosyal ilişkiler, muhasebeci ve veli — her biri için doğru araçlar.",
  "home.feature.pdf.title": "Şık PDF raporları",
  "home.feature.pdf.text":
    "Öğrenci bilgileri, grafikler ve gelişim notlarıyla indirilebilir, markalı PDF raporları.",
  "home.showcase.title": "Sınıftan aileye — tek tıkla",
  "home.showcase.text":
    "Öğretmenler değerlendirme ekler, sosyal ilişkiler yöneticileri öğrenci refahını takip eder, muhasebeciler ödemeleri yönetir, veliler otomatik olarak bilgilendirilir. Herkes tam olarak ihtiyaç duyduğunu görür.",
  "home.showcase.step1":
    "Öğretmenler değerlendirme yapar ve PDF rapor oluşturur.",
  "home.showcase.step2":
    "Veliler, rapor hazır olduğu anda uygulama içi bildirim alır.",
  "home.showcase.step3":
    "Muhasebeciler ödemeleri takip eder ve platformdan ayrılmadan hatırlatma gönderir.",
  "home.bottomCta.title": "Okulunuzu hızlandırmaya hazır mısınız?",
  "home.bottomCta.subtitle":
    "Bir dakikadan kısa sürede veli hesabı oluşturun ya da hesabınız varsa giriş yapın.",
  "home.bottomCta.signUp": "Veli hesabı oluştur",

  // SEO
  "meta.home.title":
    "Course Report — Öğrencileri, dersleri ve raporları yönetin",
  "meta.home.description":
    "Course Report; okullar ve özel ders verenler için öğrencileri, dersleri, değerlendirmeleri, ödemeleri ve veli iletişimini yönetmek için eksiksiz bir platformdur.",
  "meta.about.title": "Hakkımızda — Course Report",
  "meta.about.description":
    "Course Report, okulların ve eğitmenlerin öğrencileri, dersleri ve veli iletişimini tek platformda yönetmesine yardımcı olur.",
  "meta.contact.title": "İletişim — Course Report",
  "meta.contact.description":
    "Course Report ekibiyle iletişime geçin. Mesaj gönderin, adresimizi bulun ya da e-posta veya telefonla bize ulaşın.",

  // Footer
  "footer.tagline":
    "Öğrencileri, dersleri ve veli iletişimini tek yerde yönetin.",
  "footer.platform": "Platform",
  "footer.account": "Hesap",
  "footer.legal": "Yasal",
  "footer.terms": "Kullanım koşulları",
  "footer.privacy": "Gizlilik politikası",
  "footer.cookies": "Çerez politikası",
  "footer.rights": "Tüm hakları saklıdır.",

  // About
  "about.badge": "Hakkımızda",
  "about.heroTitle": "Öğreten, destekleyen ve büyüten herkes için yapıldı.",
  "about.heroText":
    "Course Report basit bir soruyla başladı: Bir çocuğun nasıl gittiğini ailesine anlatmak gibi önemli bir iş için neden bu kadar çok araç, tablo ve sohbet gerekiyor? Hepsini sakin ve odaklı tek bir platformda topladık.",
  "about.cta.parent": "Veli hesabı oluştur",
  "about.cta.contact": "Bize ulaşın",
  "about.mission.title": "Misyonumuz",
  "about.mission.text":
    "İyi bir eğitimin iyi bir iletişimden geçtiğine inanıyoruz. Course Report; okullara ve eğitmenlere değerlendirme, ödeme ve veli iletişimi gibi operasyonel işleri kolaylaştırır — eğitimciler asıl önemli olana, öğrencilerine odaklansın diye.",
  "about.mission.b1.bold": "Berraklık",
  "about.mission.b1.text":
    "her rol kendi odaklı panosunu görür, menü labirenti yok.",
  "about.mission.b2.bold": "Güven",
  "about.mission.b2.text":
    "raporlar, ödemeler ve mesajlar için temiz iz kayıtları.",
  "about.mission.b3.bold": "Kapsayıcılık",
  "about.mission.b3.text":
    "iki dilli arayüz (EN/TR) ve veli odaklı deneyim.",
  "about.values.title": "Değerlerimiz",
  "about.values.subtitle":
    "Geliştirdiğimiz her özelliğe rehberlik eden ilkeler.",
  "about.value1.title": "Sakin yazılım",
  "about.value1.text":
    "Gürültülü bildirim ve karanlık tasarımlar yok. Sadece doğru zamanda doğru bilgi.",
  "about.value2.title": "Varsayılan olarak gizlilik",
  "about.value2.text":
    "Hassas öğrenci verisi olması gereken yerde kalır. Her zaman rol tabanlı erişim.",
  "about.value3.title": "Eğitimcilerle birlikte yapıldı",
  "about.value3.text":
    "Gerçek öğretmenler, sosyal hizmet uzmanları ve velilerle birlikte tasarlandı.",
  "about.team.title": "Ekip",
  "about.team.subtitle":
    "Sınıfları çok önemseyen küçük bir ekibiz.",
  "about.team.aylin": "Kurucu Ortak, Ürün",
  "about.team.mehmet": "Kurucu Ortak, Mühendislik",
  "about.team.lara": "Eğitim Sorumlusu",
  "about.cta2.title": "Daha fazlasını öğrenmek ister misiniz?",
  "about.cta2.subtitle":
    "Okulunuz veya özel ders işletmeniz hakkında konuşmayı çok isteriz.",
  "about.cta2.contact": "İletişime geçin",

  // Contact
  "contact.badge": "İletişim",
  "contact.heroTitle": "Sizden haber almak isteriz.",
  "contact.heroText":
    "Sorular, iş birliği fikirleri, geri bildirim veya tanıştırmak istediğiniz bir okul — bize yazın, bir iş günü içinde dönüş yapalım.",
  "contact.info.email": "E-posta",
  "contact.info.phone": "Telefon",
  "contact.info.office": "Ofis",
  "contact.info.officeValue": "Levent, İstanbul, Türkiye",
  "contact.info.hours": "Çalışma saatleri",
  "contact.info.hoursValue": "Pzt – Cum, 09:00 – 18:00 (UTC+3)",
  "contact.form.title": "Bize mesaj gönderin",
  "contact.form.note":
    "Bu form bir yer tutucudur — e-posta gönderimi henüz aktif değil. Şimdilik lütfen yukarıdaki e-posta adresinden ulaşın.",
  "contact.form.success":
    "Teşekkürler! Mesajınız yerel olarak kaydedildi. Yakında gerçek gönderimi etkinleştireceğiz.",
  "contact.form.name": "Adınız",
  "contact.form.email": "E-posta",
  "contact.form.subject": "Konu",
  "contact.form.message": "Mesaj",
  "contact.form.consent":
    "Göndererek, talebinizle ilgili sizinle iletişime geçilmesini kabul ediyorsunuz.",
  "contact.form.send": "Mesaj gönder",
  "contact.where.title": "Buradayız",
  "contact.where.text":
    "Ziyaretler randevuyla yapılır. Önce bize e-posta gönderin, ayarlayalım.",
  "contact.cta.title": "Denemeye hazır mısınız?",
  "contact.cta.subtitle": "Bir dakikadan kısa sürede veli hesabı oluşturun.",

  // Auth
  "auth.signIn.title": "Tekrar hoş geldiniz",
  "auth.signIn.subtitle": "Veli hesabınıza giriş yapın.",
  "auth.signIn.submit": "Giriş yap",
  "auth.signIn.signingIn": "Giriş yapılıyor...",
  "auth.signIn.noAccount": "Hesabınız yok mu?",
  "auth.signIn.create": "Oluşturun",
  "auth.signIn.forgot": "Şifrenizi mi unuttunuz?",
  "auth.signUp.title": "Veli hesabınızı oluşturun",
  "auth.signUp.subtitle":
    "Çocuğunuzun profilini yönetin ve gelişiminden haberdar olun.",
  "auth.signUp.submit": "Hesap oluştur",
  "auth.signUp.haveAccount": "Hesabınız var mı?",
  "auth.signUp.signIn": "Giriş yapın",
  "auth.error.invalid": "Geçersiz giriş",
  "auth.error.signIn": "Giriş yapılamadı",
  "auth.error.signUp": "Hesap oluşturulamadı",

  // Teacher auth
  "teacherAuth.signIn.title": "Öğretmen Girişi",
  "teacherAuth.signIn.subtitle": "Personel hesabınıza giriş yapın.",
  "teacherAuth.signUp.title": "Personel hesapları yönetici tarafından oluşturulur",
  "teacherAuth.signUp.text":
    "Öğretmen, muhasebeci, sosyal ilişkiler ve yönetici hesapları bir yönetici tarafından oluşturulur. Lütfen yöneticinizle iletişime geçip hesap aldıktan sonra giriş yapın.",

  // Reset password
  "reset.title": "Şifrenizi sıfırlayın",
  "reset.subtitle":
    "E-postanızı girin, yeni şifre belirlemeniz için bir bağlantı gönderelim.",
  "reset.submit": "Sıfırlama bağlantısı gönder",
  "reset.sent": "E-posta varsa, sıfırlama bağlantısı gönderildi.",
  "reset.confirm.title": "Yeni şifre belirleyin",
  "reset.confirm.subtitle": "Yeni şifrenizi girin ve doğrulayın.",
  "reset.confirm.new": "Yeni şifre",
  "reset.confirm.repeat": "Şifreyi tekrarla",
  "reset.confirm.submit": "Şifreyi güncelle",
  "reset.confirm.success": "Şifre güncellendi. Şimdi giriş yapabilirsiniz.",
  "reset.confirm.mismatch": "Şifreler eşleşmiyor",

  // Profile
  "profile.title": "Profil",
  "profile.update": "Profili güncelle",
  "profile.changePassword": "Şifre değiştir",
  "profile.currentPassword": "Mevcut şifre",
  "profile.newPassword": "Yeni şifre",
  "profile.saved": "Profil güncellendi.",
  "profile.passwordUpdated": "Şifre güncellendi.",

  // Notifications
  "notifications.title": "Bildirimler",
  "notifications.empty": "Bildirim yok.",
  "notifications.markRead": "Okundu işaretle",
  "notifications.new": "yeni",

  // Parent
  "parent.title": "Hoş geldiniz, {{name}}",
  "parent.children.title": "Çocuklarınız",
  "parent.children.empty": "Henüz çocuk eklenmedi.",
  "parent.notifications.title": "Bildirimler",
  "parent.notifications.viewAll": "Tümünü gör",
  "parent.notifications.empty": "Bildirim yok.",
  "parent.payments.title": "Ödemeler",
  "parent.payments.empty": "Ödeme yok.",
  "parent.payments.due": "Vade {{date}}",
  "parent.payments.paid": "Ödendi {{date}}",
  "parent.reports.title": "Çocuklarınızla ilgili raporlar",
  "parent.reports.empty": "Henüz rapor yok.",
  "parent.reports.download": "İndir",
  "parent.addChild.title": "Çocuk profili ekle",
  "parent.addChild.firstName": "Ad",
  "parent.addChild.lastName": "Soyad",
  "parent.addChild.dob": "Doğum tarihi",
  "parent.addChild.address": "Adres",
  "parent.addChild.courseEmail": "Kurs e-postası",
  "parent.addChild.relationship": "Yakınlık",
  "parent.addChild.submit": "Çocuk ekle",

  // Admin overview
  "admin.title": "Yönetici özeti",
  "admin.users": "Kullanıcılar",
  "admin.reports": "Raporlar",
  "admin.expenses": "Giderler",
  "admin.payments": "Ödemeler",
  "admin.expensesTotal": "Toplam {{amount}}",
  "admin.actions.users": "Kullanıcıları yönet",
  "admin.actions.courses": "Dersleri yönet",
  "admin.actions.reports": "Tüm raporlar",
  "admin.actions.payments": "Tüm ödemeler",
  "admin.actions.expenses": "Tüm giderler",

  // Admin users
  "adminUsers.title": "Kullanıcılar",
  "adminUsers.create.title": "Personel kullanıcısı oluştur",
  "adminUsers.create.note":
    "Veliler kendi hesaplarını kayıt ile oluşturur. Bu formu öğretmen, muhasebeci, sosyal ilişkiler yöneticisi ve diğer yöneticileri eklemek için kullanın.",
  "adminUsers.create.password": "Şifre (en az 8 karakter)",
  "adminUsers.create.submit": "Kullanıcı oluştur",
  "adminUsers.create.success": "{{name}} ({{role}}) oluşturuldu.",
  "adminUsers.create.error": "Kullanıcı oluşturulamadı",
  "adminUsers.col.name": "Ad",
  "adminUsers.col.email": "E-posta",
  "adminUsers.col.role": "Rol",
  "adminUsers.col.created": "Oluşturulma",

  // Admin reports
  "adminReports.title": "Tüm raporlar",
  "adminReports.empty": "Rapor yok.",

  // Accountant
  "acct.title": "Muhasebe",
  "acct.payments": "Ödemeler",
  "acct.expenses": "Giderler",
  "acct.status.paid": "Ödendi",
  "acct.status.pending": "Bekliyor",
  "acct.status.overdue": "Gecikmiş",
  "acct.status.cancelled": "İptal",
  "acct.expensesSummary": "{{count}} gider, toplam {{total}}",

  // Accountant payments
  "acctPayments.title": "Ödemeler",
  "acctPayments.new": "Yeni ödeme",
  "acctPayments.all": "Tüm ödemeler",
  "acctPayments.empty": "Ödeme yok.",
  "acctPayments.selectStudent": "Öğrenci seç...",
  "acctPayments.dueDate": "Vade tarihi",
  "acctPayments.notesPh": "Notlar (isteğe bağlı)",
  "acctPayments.add": "Ödeme ekle",
  "acctPayments.allStatuses": "Tüm durumlar",
  "acctPayments.searchStudent": "Öğrenci ara...",
  "acctPayments.col.student": "Öğrenci",
  "acctPayments.col.parent": "Veli",
  "acctPayments.col.due": "Vade",
  "acctPayments.col.paid": "Ödendi",
  "acctPayments.remind": "Hatırlat",
  "acctPayments.remindSent": "{{n}} veliye hatırlatma gönderildi.",
  "acctPayments.deleteConfirm": "Bu ödeme silinsin mi?",

  // Accountant expenses
  "acctExp.title": "Giderler",
  "acctExp.totalSuffix": "Toplam {{amount}}",
  "acctExp.new": "Yeni gider",
  "acctExp.add": "Gider ekle",
  "acctExp.empty": "Gider yok.",
  "acctExp.col.title": "Başlık",
  "acctExp.col.author": "Yazar",
  "acctExp.col.description": "Açıklama",
  "acctExp.deleteConfirm": "Bu gider silinsin mi?",

  // Teacher dashboard
  "teacher.title": "Öğretmen Panosu",
  "teacher.students": "Öğrenciler",
  "teacher.evaluations": "Değerlendirmeler",
  "teacher.newEvaluation": "Yeni değerlendirme",
  "teacher.empty": "Henüz öğrenci yok.",

  // Evaluations
  "eval.newTitle": "Yeni değerlendirme",
  "eval.backTeacher": "Öğretmen panosuna dön",
  "eval.student": "Öğrenci",
  "eval.course": "Ders",
  "eval.selectStudent": "Öğrenci seç...",
  "eval.selectCourse": "Ders seç...",
  "eval.points": "Puan (1-5)",
  "eval.parameters": "Değerlendirme parametreleri",
  "eval.comment": "Ders yorumu",
  "eval.progress": "Gelişim değerlendirmesi",
  "eval.progressShort": "Gelişim",
  "eval.progressPlaceholder": "örn. güçlü gelişim, zorlandığı alanlar...",
  "eval.save": "Değerlendirmeyi kaydet",
  "eval.add": "Değerlendirme ekle",
  "eval.empty": "Henüz değerlendirme yok.",
  "eval.none": "Değerlendirme yok.",
  "eval.openStudent": "Öğrenciyi aç",
  "eval.report.performance": "Puan grafiği",
  "eval.report.summary": "Aylık özet",
  "eval.report.timeline": "Değerlendirme zaman çizelgesi",
  "eval.report.average": "{{count}} değerlendirme üzerinden ortalama puan: {{rating}}/5.",
  "eval.report.noRating": "Bu ay için yıldız puanı kaydedilmedi.",
  "eval.report.noComments": "Bu ay için öğretmen yorumu kaydedilmedi.",
  "eval.report.commentOverview": "Yorum özeti",
  "eval.criteria.vocabulary": "Kelime bilgisi",
  "eval.criteria.grammar": "Dil bilgisi",
  "eval.criteria.listening_comprehension": "Dinleme anlama",
  "eval.criteria.reading_comprehension": "Okuma anlama",
  "eval.criteria.speaking": "Konuşma",
  "eval.criteria.writing": "Yazma",
  "eval.criteria.pronunciation": "Telaffuz",
  "eval.criteria.confidence": "Özgüven",
  "eval.criteria.autonomy": "Özerklik",
  "eval.status.in_progress": "Gelişiyor",
  "eval.status.needs_work": "Çalışılmalı",
  "eval.status.priority": "Öncelikli güçlendirilmeli",

  // Inbox
  "inbox.title": "Gelen Kutusu",
  "inbox.individual": "Bireysel",
  "inbox.shared": "Paylaşılan",
  "inbox.compose": "Yeni mesaj",
  "inbox.empty": "Mesaj yok.",
};

const resources = {
  en: { translation: en },
  tr: { translation: tr },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export const SUPPORTED_LANGUAGES = ["en", "tr"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export default i18n;
