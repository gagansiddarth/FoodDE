# FoodDE - Smart Food Ingredient Analyzer

A professional web application that helps consumers make informed decisions about packaged food products through intelligent ingredient analysis and nutritional insights.

## Overview

FoodDE provides instant analysis of food ingredient lists, helping users understand what they're consuming. The platform combines advanced AI technology with nutritional expertise to deliver clear, actionable health insights.

## Key Features

- **Smart Ingredient Analysis** - AI-powered classification of ingredients by health impact
- **Health Scoring System** - Comprehensive scoring with visual indicators
- **Image Recognition** - Upload food label photos for automatic text extraction
- **Nutritional Chatbot** - Get detailed answers about ingredients and health effects
- **User Profiles** - Save scans and track your food choices over time
- **Mobile-First Design** - Optimized for all devices and screen sizes

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Authentication)
- **AI Services**: Google Gemini API for intelligent analysis
- **OCR**: Tesseract.js for image text extraction
- **Build Tool**: Vite for fast development and optimized builds

## Getting Started

### Prerequisites

- Node.js 18+ or Bun runtime
- Supabase account for backend services
- Google Gemini API key for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-ingredient-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file with your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## Usage

### Basic Workflow

1. **Upload or Input** - Provide ingredient list via image upload or text input
2. **Get Analysis** - Receive comprehensive health score and ingredient breakdown
3. **Review Results** - See flagged ingredients with detailed explanations
4. **Ask Questions** - Use the AI chatbot for additional nutritional insights
5. **Save & Track** - Store important scans in your personal history

### Health Score System

- **80-100**: Excellent - Optimal choice for health
- **60-79**: Good - Generally healthy with minor considerations
- **40-59**: Fair - Some concerning ingredients present
- **20-39**: Poor - Multiple health concerns identified
- **0-19**: Very Poor - Significant health risks detected

## Development

### Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Application pages and routes
├── utils/         # Core business logic and utilities
├── hooks/         # Custom React hooks
└── integrations/  # External service connections
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run code quality checks
- `npm run preview` - Preview production build

## Deployment

### Production Build

```bash
npm run build
```

### Deployment Options

- **Vercel** - Zero-config deployment with automatic builds
- **Netlify** - Simple drag-and-drop deployment
- **Supabase Hosting** - Integrated backend and frontend hosting
- **Static Hosting** - Deploy to any static file hosting service

## Contributing

We welcome contributions from the community. Please ensure your code follows our established patterns and includes appropriate tests.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For technical support or feature requests, please open an issue in the repository.

---

**FoodDE** - Empowering informed food choices through technology.
