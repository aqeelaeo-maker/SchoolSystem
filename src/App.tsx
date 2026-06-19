/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Academics from './pages/Academics';
import Finance from './pages/Finance';
import Users from './pages/Users';
import Results from './pages/Results';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/results" element={<Results />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/users" element={<Users />} />
          <Route path="/transport" element={<PlaceholderPage title="Transport Management" />} />
          <Route path="/hostel" element={<PlaceholderPage title="Hostel Management" />} />
          {/* Catch-all */}
          <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
