// =============================================
// ADMIN LINK CONFIGURATION
// Set SHOW_ADMIN_LINK to true to show the admin link in generated HTML
// Set to false to hide it completely
// =============================================
const SHOW_ADMIN_LINK = true; // Change this to false to hide the admin link
// =============================================

// Rest of your server.js code...

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('.')); // Serve static files from the current directory

// File paths
const PORTFOLIOS_DIR = 'portfolios';
const PORTFOLIOS_DATA_FILE = path.join(PORTFOLIOS_DIR, 'data.json');

// Ensure portfolios directory exists
if (!fs.existsSync(PORTFOLIOS_DIR)) {
    fs.mkdirSync(PORTFOLIOS_DIR);
}

// Load portfolios from file if it exists
let portfolios = [];
try {
    if (fs.existsSync(PORTFOLIOS_DATA_FILE)) {
        const data = fs.readFileSync(PORTFOLIOS_DATA_FILE, 'utf8');
        portfolios = JSON.parse(data);
        console.log(`Loaded ${portfolios.length} portfolios from file`);
    }
} catch (err) {
    console.error('Error loading portfolios file:', err);
}

// Save portfolios to file
function savePortfoliosToFile() {
    try {
        fs.writeFileSync(PORTFOLIOS_DATA_FILE, JSON.stringify(portfolios, null, 2));
        console.log('Portfolios saved to file');
    } catch (error) {
        console.error('Error saving portfolios to file:', error);
    }
}

// API Routes
app.get('/api/portfolios', (req, res) => {
    res.json(portfolios);
});

app.post('/api/portfolios', (req, res) => {
    try {
        const portfolio = req.body;
        portfolio.id = Date.now().toString(); // Generate unique ID
        portfolio.createdAt = new Date().toISOString();
        portfolio.updatedAt = new Date().toISOString();
        
        portfolios.push(portfolio);
        savePortfoliosToFile();
        
        // Generate the portfolio page
        generatePortfolioPage(portfolio);
        
        res.json({ success: true, message: 'Portfolio added successfully', id: portfolio.id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/portfolios/:id', (req, res) => {
    try {
        const id = req.params.id;
        const updatedPortfolio = req.body;
        updatedPortfolio.updatedAt = new Date().toISOString();
        
        const index = portfolios.findIndex(p => p.id === id);
        if (index !== -1) {
            // Preserve created date
            updatedPortfolio.createdAt = portfolios[index].createdAt;
            portfolios[index] = { ...portfolios[index], ...updatedPortfolio };
            savePortfoliosToFile();
            
            // Regenerate the portfolio page
            generatePortfolioPage(portfolios[index]);
            
            res.json({ success: true, message: 'Portfolio updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Portfolio not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/portfolios/:id', (req, res) => {
    try {
        const id = req.params.id;
        
        const index = portfolios.findIndex(p => p.id === id);
        if (index !== -1) {
            // Remove the portfolio HTML file
            const portfolioFile = `portfolios/portfolio-${id}.html`;
            if (fs.existsSync(portfolioFile)) {
                fs.unlinkSync(portfolioFile);
            }
            
            portfolios.splice(index, 1);
            savePortfoliosToFile();
            res.json({ success: true, message: 'Portfolio deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Portfolio not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/portfolio/:id', (req, res) => {
    try {
        const id = req.params.id;
        const portfolio = portfolios.find(p => p.id === id);
        
        if (portfolio) {
            res.json(portfolio);
        } else {
            res.status(404).json({ success: false, message: 'Portfolio not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Function to generate header HTML with optional admin link
// Function to generate header HTML with optional admin link
function generateHeaderHtml() {
    let adminLink = '';
    
    if (SHOW_ADMIN_LINK) {
        adminLink = '<a href="admin.html">Admin</a>';
    }
    
    return `
        <header class="top-bar">
            <div class="logo">
                YASHENVI
            </div>
            <div class="right-bar">
                <nav class="header-menu" id="headerMenu">
                    <a href="#intro">Home</a>
                    <a href="#contact">Contact Me</a>
                    <a href="#product">Products</a>
                    ${adminLink}
                </nav>
                <button class="menu-btn" id="menuToggle" aria-label="Toggle menu">MENU</button>
            </div>
        </header>
    `;
}

// Generate main index.html
app.post('/api/generate-html', (req, res) => {
    try {
        // Read the template for index.html
        let indexHtml = fs.readFileSync('index-template.html', 'utf8');
        
        // Generate header with optional admin link
        const headerHtml = generateHeaderHtml(true); // Set to false to hide admin link
        
        // Generate portfolio sections HTML
        let portfolioSections = '';
        portfolios.forEach((portfolio, index) => {
            portfolioSections += `
                <section id="portfolio-${portfolio.id}" class="page-section align-left">
                    <img class="section-object" src="${portfolio.imageUrl}" alt="${portfolio.title}">
                    <div class="page-section-content">
                        <h1>${portfolio.title}</h1>
                        <p>${portfolio.subtitle}</p>
                        <a href="portfolios/portfolio-${portfolio.id}.html" class="portfolio-btn">View Portfolio</a>
                    </div>
                </section>
            `;
        });
        
        // Replace the placeholders with actual content
        indexHtml = indexHtml
            .replace('<!-- HEADER -->', headerHtml)
            .replace('<!-- PORTFOLIO_SECTIONS -->', portfolioSections);
        
        // Write the updated index.html
        fs.writeFileSync('index.html', indexHtml);
        
        // Generate all portfolio pages
        portfolios.forEach(portfolio => {
            generatePortfolioPage(portfolio, true); // Pass true to include admin link
        });
        
        res.json({ success: true, message: 'HTML files generated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update the generatePortfolioPage function
function generatePortfolioPage(portfolio, includeAdminLink) {
    try {
        // Read the portfolio template
        let portfolioHtml = fs.readFileSync('portfolio-template.html', 'utf8');
        
        // Generate header with optional admin link
        const headerHtml = generateHeaderHtml(includeAdminLink);
        
        // Replace placeholders with actual content
        portfolioHtml = portfolioHtml
            .replace('<!-- HEADER -->', headerHtml)
            .replace(/{{TITLE}}/g, portfolio.title)
            .replace(/{{SUBTITLE}}/g, portfolio.subtitle)
            .replace(/{{IMAGE_URL}}/g, portfolio.imageUrl)
            .replace(/{{CONTENT}}/g, portfolio.content || '')
            .replace(/{{ID}}/g, portfolio.id);
        
        // Write the portfolio HTML file
        fs.writeFileSync(`portfolios/portfolio-${portfolio.id}.html`, portfolioHtml);
        
        console.log(`Generated portfolio page: portfolios/portfolio-${portfolio.id}.html`);
    } catch (error) {
        console.error('Error generating portfolio page:', error);
    }
}

app.get('/api/download-index', (req, res) => {
    res.download('index.html');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Admin interface available at http://localhost:${PORT}/admin.html`);
    
    // Generate all portfolio pages on server start
    portfolios.forEach(portfolio => {
        if (!fs.existsSync(`portfolios/portfolio-${portfolio.id}.html`)) {
            generatePortfolioPage(portfolio);
        }
    });
});

