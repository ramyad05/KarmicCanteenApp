// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Something went wrong');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Admin API calls
const adminAPI = {
    register: (data) => apiCall('/admin/register', 'POST', data),
    login: (data) => apiCall('/admin/login', 'POST', data)
};

// Employee API calls
const employeeAPI = {
    register: (data) => apiCall('/employee/register', 'POST', data),
    login: (data) => apiCall('/employee/login', 'POST', data)
};

// Menu API calls
const menuAPI = {
    getMenu: () => apiCall('/menu', 'GET'),
    updateMenu: (data) => apiCall('/menu', 'POST', data),
    updateDayMenu: (day, data) => apiCall(`/menu/day/${day}`, 'PUT', data)
};

// Submission API calls
const submissionAPI = {
    submit: (data) => apiCall('/submissions', 'POST', data),
    getEmployeeSubmissions: (email, date = null) => {
        const url = date ? `/submissions/${email}?date=${date}` : `/submissions/${email}`;
        return apiCall(url, 'GET');
    },
    getStats: (date = null) => {
        const url = date ? `/submissions/stats?date=${date}` : '/submissions/stats';
        return apiCall(url, 'GET');
    }
};

// Utility API calls
const utilityAPI = {
    getMenuDate: () => apiCall('/menu-date', 'GET')
};