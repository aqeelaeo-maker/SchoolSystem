/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<PlaceholderPage title="Teacher Management" />} />
          <Route path="/academics" element={<PlaceholderPage title="Academics" />} />
          <Route path="/finance" element={<PlaceholderPage title="Finance Module" />} />
          <Route path="/transport" element={<PlaceholderPage title="Transport Management" />} />
          <Route path="/hostel" element={<PlaceholderPage title="Hostel Management" />} />
          {/* Catch-all */}
          <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
