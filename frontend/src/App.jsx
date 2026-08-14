import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ArticlePage from "./pages/ArticlePage";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import CreateArticle from "./pages/CreateArticle";
import DashboardLayout from "./dashboard/DashboardLayout";
import DashboardHome from "./dashboard/Home";
import Profile from "./dashboard/Profile";
import Bookmark from "./dashboard/Bookmark";
import Activity from "./dashboard/Activity";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Drafts from "./admin/pages/Drafts";
import Scheduled from "./admin/pages/Scheduled";
import Categories from "./admin/pages/Categories";
import Article from "./admin/pages/Articles";
import AdminBookmark from "./admin/pages/AdminBookmark";
import EditArticle from "./admin/pages/EditArticle"
import Footer from "./components/Footer";




function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/article/:slug" element={<ArticlePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<CreateArticle />} />
        {/* User Dashboard */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute role="user">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bookmarks" element={<Bookmark />} />
          <Route path="activity" element={<Activity />} />
        </Route>

        {/* Admin Dashboard */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="drafts" element={<Drafts />} />
          <Route path="scheduled" element={<Scheduled />} />
          <Route path="categories" element={<Categories />} />
          <Route path="articles" element={<Article />} />
          <Route path="adminbookmark" element={<AdminBookmark />} />
          <Route path="articles/edit/:id" element={<EditArticle />} />
        </Route>
      </Routes> 
     <Footer/>
      
    </BrowserRouter>
  );
}

export default App;