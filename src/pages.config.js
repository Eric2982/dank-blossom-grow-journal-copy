/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Analytics from './pages/Analytics';
import Challenges from './pages/Challenges';
import Chat from './pages/Chat';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Nutrients from './pages/Nutrients';
import Premium from './pages/Premium';
import Settings from './pages/Settings';
import Store from './pages/Store';
import StrainDetail from './pages/StrainDetail';
import Summary from './pages/Summary';
import __Layout from './Layout';

export const PAGES = {
	"Challenges": Challenges,
	"Chat": Chat,
	"Community": Community,
	"Dashboard": Dashboard,
	"Learn": Learn,
	"Nutrients": Nutrients,
	"Premium": Premium,
	"Settings": Settings,
	"Store": Store,
	"StrainDetail": StrainDetail,
	"Summary": Summary,
};

export const pagesConfig = {
	mainPage: "Dashboard",
	Pages: PAGES,
	Layout: __Layout,
};