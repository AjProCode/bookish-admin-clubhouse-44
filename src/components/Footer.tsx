
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">SkillBag Book Club</h3>
            <p className="text-gray-600">
              A community of book lovers sharing knowledge and skills through reading.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-bookclub-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/books" className="text-gray-600 hover:text-bookclub-primary transition-colors">
                  Books
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-gray-600 hover:text-bookclub-primary transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Email: contact@skillbagbooks.com</li>
              <li>Phone: (555) 123-4567</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} SkillBag Book Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
