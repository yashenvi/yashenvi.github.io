const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('.')); // Serve static files from the current directory

// In-memory storage for portfolios
let portfolios = [];

// Load portfolios from file if it exists
try {
    const data = fs.readFileSync('portfolios/data.json', 'utf8');
    portfolios = JSON.parse(data);
} catch (err) {
    console.log('No existing portfolios file found, starting with empty array');
    // Create portfolios directory if it doesn't exist
    if (!fs.existsSync('portfolios')) {
        fs.mkdirSync('portfolios');
    }
}

// Save portfolios to file
function savePortfoliosToFile() {
    fs.writeFileSync('portfolios/data.json', JSON.stringify(portfolios, null, 2));
}

// API Routes
app.get('/api/portfolios', (req, res) => {
    res.json(portfolios);
});

app.post('/api/portfolios', (req, res) => {
    const portfolio = req.body;
    portfolio.id = Date.now().toString(); // Generate unique ID
    portfolios.push(portfolio);
    savePortfoliosToFile();
    generatePortfolioPage(portfolio);
    res.json({ success: true, message: 'Portfolio added successfully', id: portfolio.id });
});

app.put('/api/portfolios/:id', (req, res) => {
    const id = req.params.id;
    const updatedPortfolio = req.body;
    
    const index = portfolios.findIndex(p => p.id === id);
    if (index !== -1) {
        portfolios[index] = { ...portfolios[index], ...updatedPortfolio };
        savePortfoliosToFile();
        generatePortfolioPage(portfolios[index]);
        res.json({ success: true, message: 'Portfolio updated successfully' });
    } else {
        res.status(404).json({ success: false, message: 'Portfolio not found' });
    }
});

app.delete('/api/portfolios/:id', (req, res) => {
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
});

app.get('/api/portfolio/:id', (req, res) => {
    const id = req.params.id;
    const portfolio = portfolios.find(p => p.id === id);
    
    if (portfolio) {
        res.json(portfolio);
    } else {
        res.status(404).json({ success: false, message: 'Portfolio not found' });
    }
});

// Generate individual portfolio page
function generatePortfolioPage(portfolio) {
    try {
        // Read the portfolio template
        let portfolioHtml = fs.readFileSync('portfolio-template.html', 'utf8');
        
        // Replace placeholders with actual content
        portfolioHtml = portfolioHtml
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

// Generate main index.html
app.post('/api/generate-html', (req, res) => {
    try {
        // Read the template for index.html
        let indexHtml = fs.readFileSync('index-template.html', 'utf8');
        
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
        
        // Replace the placeholder with actual portfolio sections
        indexHtml = indexHtml.replace('<!-- PORTFOLIO_SECTIONS -->', portfolioSections);
        
        // Write the updated index.html
        fs.writeFileSync('index.html', indexHtml);
        
        // Generate all portfolio pages
        portfolios.forEach(generatePortfolioPage);
        
        res.json({ success: true, message: 'HTML files generated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/download-index', (req, res) => {
    res.download('index.html');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Admin interface available at http://localhost:${PORT}/admin.html`);
});