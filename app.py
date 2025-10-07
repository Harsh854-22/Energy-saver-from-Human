from flask import Flask, render_template, jsonify, request
import cv2
import threading
import time

app = Flask(__name__)

# Global variables to store detection state
human_detected = False
human_count = 0
total_detections = 0
energy_saved = 0.0
last_detection_time = time.time()
detection_running = False
camera_available = False

# Thread and camera objects
detection_thread = None
cap = None

# Constants for energy calculation
POWER_CONSUMPTION = 10  # Watts (typical LED bulb)
ENERGY_RATE_PER_SECOND = POWER_CONSUMPTION / 3600  # Watt-hours per second

def detect_humans():
    """Background thread function for human detection"""
    global human_detected, human_count, total_detections, energy_saved, last_detection_time, detection_running, camera_available, cap
    
    try:
        # Try to open camera
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("Warning: Camera not available. Using simulation mode.")
            camera_available = False
            # Simulation mode for testing
            simulate_detection()
            return
        
        camera_available = True
        print("Camera initialized successfully")
        
        # Load Haar Cascade for face detection (more reliable than fullbody)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        upper_body_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_upperbody.xml')
        
        consecutive_no_detection = 0
        last_state = False
        
        while detection_running:
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.1)
                continue
            
            # Convert to grayscale for detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces and upper bodies
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
            upper_bodies = upper_body_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(50, 50))
            
            current_time = time.time()
            
            # Update detection state
            if len(faces) > 0 or len(upper_bodies) > 0:
                consecutive_no_detection = 0
                if not last_state:
                    human_count += 1
                    last_state = True
                    print(f"Human detected! Total count: {human_count}")
                human_detected = True
                last_detection_time = current_time
            else:
                consecutive_no_detection += 1
                # Only set to False after multiple consecutive no-detections (reduce flicker)
                if consecutive_no_detection > 3:
                    if last_state:
                        last_state = False
                        print("Human no longer detected")
                    human_detected = False
            
            # Calculate energy saved when no human is detected (light is OFF)
            if not human_detected:
                time_elapsed = current_time - last_detection_time
                energy_saved += time_elapsed * ENERGY_RATE_PER_SECOND
                last_detection_time = current_time
            else:
                last_detection_time = current_time
            
            total_detections += 1
            time.sleep(0.3)  # Update every 0.3 seconds
            
    except Exception as e:
        print(f"Error in detection thread: {e}")
        camera_available = False
        simulate_detection()
    finally:
        if cap is not None:
            cap.release()

def simulate_detection():
    """Simulation mode when camera is not available"""
    global human_detected, human_count, energy_saved, last_detection_time, detection_running
    
    print("Running in simulation mode...")
    import random
    
    while detection_running:
        current_time = time.time()
        
        # Randomly simulate human detection
        if random.random() > 0.7:  # 30% chance of detection
            if not human_detected:
                human_count += 1
                print(f"[SIM] Human detected! Total count: {human_count}")
            human_detected = True
            last_detection_time = current_time
        else:
            if human_detected:
                print("[SIM] Human no longer detected")
            human_detected = False
            
            # Calculate energy saved
            time_elapsed = current_time - last_detection_time
            energy_saved += time_elapsed * ENERGY_RATE_PER_SECOND
            last_detection_time = current_time
        
        time.sleep(2)  # Update every 2 seconds in simulation mode

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/status')
def status():
    """Get current detection status"""
    return jsonify({
        'human_detected': human_detected,
        'human_count': human_count,
        'energy_saved': round(energy_saved, 3),
        'detection_running': detection_running,
        'camera_available': camera_available
    })

@app.route('/toggle', methods=['POST'])
def toggle_detection():
    """Start or stop detection"""
    global detection_running, detection_thread, human_detected, last_detection_time
    
    data = request.get_json()
    should_start = data.get('start', False)
    
    if should_start and not detection_running:
        detection_running = True
        last_detection_time = time.time()
        detection_thread = threading.Thread(target=detect_humans, daemon=True)
        detection_thread.start()
        return jsonify({'status': 'started', 'message': 'Detection started'})
    elif not should_start and detection_running:
        detection_running = False
        human_detected = False
        if cap is not None:
            cap.release()
        return jsonify({'status': 'stopped', 'message': 'Detection stopped'})
    
    return jsonify({'status': 'unchanged', 'message': 'No change in detection state'})

@app.route('/reset', methods=['POST'])
def reset_counters():
    """Reset all counters"""
    global human_count, energy_saved, total_detections
    human_count = 0
    energy_saved = 0.0
    total_detections = 0
    return jsonify({'status': 'reset', 'message': 'Counters reset successfully'})

if __name__ == '__main__':
    print("=" * 50)
    print("Human Detection System Starting...")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)