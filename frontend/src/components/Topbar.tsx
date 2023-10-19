import React from 'react';
import Logo from './Logo';
import { Link } from 'react-router-dom';

export default function Topbar({ title }: { title: string }) {
    return (
        <div className="tb-container">
            <Link to="/" style={{height: '100%'}}>
                <Logo />
            </Link>
            <Link to="/">
                <h1>{title}</h1>
            </Link>            
            <Link to="/" style={{height: '100%', display: 'flex', alignItems: 'center'}}>
                <div className="menu-icon">
                    <div className="menu-icon-bar"></div>
                </div>
            </Link>
        </div>
    );
}