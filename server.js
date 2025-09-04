const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Body parser first
app.use(bodyParser.json({ limit: '50mb' }));

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

// Items data file
const ITEMS_DATA_FILE = path.join(PORTFOLIOS_DIR, 'items.json');
let items = [];

// Load items from file if it exists
try {
    if (fs.existsSync(ITEMS_DATA_FILE)) {
        const data = fs.readFileSync(ITEMS_DATA_FILE, 'utf8');
        items = JSON.parse(data);
        console.log(`Loaded ${items.length} items from file`);
    }
} catch (err) {
    console.error('Error loading items file:', err);
}

// Save items to file
function saveItemsToFile() {
    try {
        fs.writeFileSync(ITEMS_DATA_FILE, JSON.stringify(items, null, 2));
        console.log('Items saved to file');
    } catch (error) {
        console.error('Error saving items to file:', error);
    }
}

// API Routes - Define these BEFORE static file serving
app.get('/api/portfolios', (req, res) => {
    res.json(portfolios);
});

app.post('/api/portfolios', (req, res) => {
    try {
        const portfolio = req.body;
        portfolio.id = Date.now().toString();
        portfolio.createdAt = new Date().toISOString();
        portfolio.updatedAt = new Date().toISOString();
        
        portfolios.push(portfolio);
        savePortfoliosToFile();
        
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
            updatedPortfolio.createdAt = portfolios[index].createdAt;
            portfolios[index] = { ...portfolios[index], ...updatedPortfolio };
            savePortfoliosToFile();
            
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

// Items API routes
app.get('/api/portfolios/:portfolioId/items', (req, res) => {
    try {
        const portfolioId = req.params.portfolioId;
        const portfolioItems = items.filter(item => item.portfolioId === portfolioId);
        res.json(portfolioItems);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/items', (req, res) => {
    try {
        const item = req.body;
        item.id = Date.now().toString();
        item.createdAt = new Date().toISOString();
        item.updatedAt = new Date().toISOString();
        
        items.push(item);
        saveItemsToFile();
        
        res.json({ success: true, message: 'Item added successfully', id: item.id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/items/:id', (req, res) => {
    try {
        const id = req.params.id;
        const updatedItem = req.body;
        updatedItem.updatedAt = new Date().toISOString();
        
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            updatedItem.createdAt = items[index].createdAt;
            items[index] = { ...items[index], ...updatedItem };
            saveItemsToFile();
            
            res.json({ success: true, message: 'Item updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/items/:id', (req, res) => {
    try {
        const id = req.params.id;
        
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items.splice(index, 1);
            saveItemsToFile();
            res.json({ success: true, message: 'Item deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// HTML Generation API
app.post('/api/generate-html', (req, res) => {
    try {
        let indexHtml = fs.readFileSync('index-template.html', 'utf8');
        
        const headerHtml = generateHeaderHtml();
        
        let portfolioSections = '';
        portfolios.forEach((portfolio) => {
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
        
        indexHtml = indexHtml
            .replace('<!-- HEADER -->', headerHtml)
            .replace('<!-- PORTFOLIO_SECTIONS -->', portfolioSections);
        
        fs.writeFileSync('index.html', indexHtml);
        
        portfolios.forEach(generatePortfolioPage);
        
        res.json({ success: true, message: 'HTML files generated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/download-index', (req, res) => {
    res.download('index.html');
});

// Helper functions
function generateHeaderHtml() {
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
                </nav>
                <button class="menu-btn" id="menuToggle" aria-label="Toggle menu">MENU</button>
            </div>
        </header>
    `;
}

function generatePortfolioPage(portfolio) {
    try {
        let portfolioHtml = fs.readFileSync('portfolio-template.html', 'utf8');
        
        const headerHtml = generateHeaderHtml();
        
        portfolioHtml = portfolioHtml
            .replace('<!-- HEADER -->', headerHtml)
            .replace(/{{TITLE}}/g, portfolio.title)
            .replace(/{{SUBTITLE}}/g, portfolio.subtitle)
            .replace(/{{IMAGE_URL}}/g, portfolio.imageUrl)
            .replace(/{{CONTENT}}/g, portfolio.content || '')
            .replace(/{{ID}}/g, portfolio.id);
        
        fs.writeFileSync(`portfolios/portfolio-${portfolio.id}.html`, portfolioHtml);
        
        console.log(`Generated portfolio page: portfolios/portfolio-${portfolio.id}.html`);
    } catch (error) {
        console.error('Error generating portfolio page:', error);
    }
}

// Static file serving - This should come AFTER API routes
app.use(express.static('.'));

// Add a catch-all handler for undefined API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Admin interface available at http://localhost:${PORT}/admin.html`);
    
    portfolios.forEach(portfolio => {
        if (!fs.existsSync(`portfolios/portfolio-${portfolio.id}.html`)) {
            generatePortfolioPage(portfolio);
        }
    });
});