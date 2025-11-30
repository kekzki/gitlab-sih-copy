import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Search, BarChart, Eye, LogIn } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();

    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Taxonomy', path: '/taxonomy', icon: Compass },
        { name: 'Search', path: '/search', icon: Search },
        { name: 'Visualisation', path: '/visualization', icon: Eye },
        { name: 'Analysis', path: '/analysis', icon: BarChart },
        { name: 'Login', path: '/login', icon: LogIn },
    ];

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                <div className="logo-icon">
                    P
                </div>
                <span className="logo-text">
                    ParadoxX6
                </span>
            </Link>
            
            <div className="navbar-links">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={16} />
                            <span className="nav-text">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    )
}

export default Navbar