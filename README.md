# 💡 Automatic Bulb - Human Detection System

A smart energy-saving web application that automatically detects human presence and controls lighting accordingly.

## 🚀 Features

- **Real-time Human Detection**: Uses OpenCV with Haar Cascade classifiers to detect humans via webcam
- **Visual Indicators**: 
  - 🟢 **Green Button**: Human detected - Light ON
  - 🔴 **Red Button**: No human - Light OFF (Energy Saving Mode)
- **Human Counter**: Tracks total number of human detections
- **Energy Savings Calculator**: Real-time calculation of energy saved (in Watt-hours)
- **CO₂ Reduction Tracker**: Shows environmental impact of energy savings
- **Simulation Mode**: Automatically switches to simulation if no camera is available
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 📋 Prerequisites

- Python 3.8 or higher
- Webcam (optional - will run in simulation mode if not available)
- Modern web browser

## 🛠️ Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd c:\Users\admin\Desktop\KushalBhaykaAutomaticbulb\webhai
   ```

2. **Install required Python packages**:
   ```bash
   pip install -r requirements.txt
   ```

   Or install manually:
   ```bash
   pip install Flask opencv-python numpy
   ```

## 🎯 Usage

1. **Start the Flask server**:
   ```bash
   python app.py
   ```

2. **Open your web browser** and navigate to:
   ```
   http://localhost:5000
   ```

3. **Click "Start Detection"** to begin human detection

4. **Watch the magic happen**:
   - The indicator turns GREEN when humans are detected (light ON)
   - The indicator turns RED when no humans are present (light OFF, saving energy)
   - Monitor your human count and energy savings in real-time!

## 📁 Project Structure

```
webhai/
│
├── app.py                 # Flask backend with human detection logic
├── requirements.txt       # Python dependencies
├── README.md             # This file
│
├── templates/
│   └── index.html        # HTML frontend
│
└── static/
    ├── styles.css        # CSS styling
    └── script.js         # JavaScript frontend logic
```

## 🔧 How It Works

### Backend (Python - app.py)
- Uses Flask web framework for the server
- Implements OpenCV for human detection using Haar Cascade classifiers
- Runs detection in a separate thread to avoid blocking
- Provides REST API endpoints for status updates
- Calculates energy savings based on power consumption (10W typical LED bulb)

### Frontend (HTML/CSS/JavaScript)
- **index.html**: Structure and layout
- **styles.css**: Beautiful gradient design with animations
- **script.js**: Handles real-time updates and user interactions

### Detection Logic
1. Captures video frames from webcam
2. Converts frames to grayscale
3. Applies Haar Cascade classifiers for face and upper body detection
4. Updates global state (human detected/not detected)
5. Calculates energy saved when no human is present
6. Sends status updates to frontend via REST API

## 🎨 Features Explained

### Human Counter
Increments each time a human is newly detected (not every frame, only on state change from "no human" to "human detected").

### Energy Saved
- Calculated based on a 10W LED bulb
- Energy is saved only when light is OFF (no human detected)
- Displayed in Watt-hours (Wh)

### CO₂ Reduction
- Calculated based on average CO₂ emissions per kWh (0.5 kg/kWh)
- Helps visualize environmental impact

### Simulation Mode
If no camera is available, the system automatically runs in simulation mode with random human detections for testing purposes.

## 🔑 Keyboard Shortcuts

- **Spacebar**: Toggle detection on/off
- **Ctrl+R**: Reset counters

## 🌐 API Endpoints

- `GET /` - Main page
- `GET /status` - Get current detection status
- `POST /toggle` - Start/stop detection
- `POST /reset` - Reset all counters

## 🐛 Troubleshooting

### Camera not working?
- Check if your webcam is properly connected
- Ensure no other application is using the camera
- The system will automatically switch to simulation mode if camera is unavailable

### Port already in use?
- Change the port in `app.py`:
  ```python
  app.run(debug=True, host='0.0.0.0', port=5001)
  ```

## 💡 Energy Savings Calculation

```
Energy Saved (Wh) = Time with no human (hours) × Power (10W)
CO₂ Reduced (g) = Energy Saved (kWh) × 0.5 × 1000
```

## 🎯 Use Cases

- **Smart Homes**: Automatic lighting control
- **Office Spaces**: Reduce energy waste in meeting rooms
- **Public Restrooms**: Automatic lighting
- **Security**: Monitor presence in restricted areas
- **Education**: Learn about IoT and computer vision

## 📝 License

Free to use and modify for educational purposes.

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

## 📧 Support

For issues or questions, please check the code comments or create an issue in your repository.

---

Built with ❤️ using Python Flask, OpenCV & JavaScript
