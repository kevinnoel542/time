import tkinter as tk
import pygame
from plyer import notification
import datetime

# --- Init Sound System ---
pygame.mixer.init()

# --- Global States ---
timer_running = False
time_left = 40 * 60
work_duration = 40 * 60
break_duration = 10 * 60
timer_id = None

# --- Timer Functions ---

def start_timer():
    global timer_running, time_left, work_duration, break_duration
    if not timer_running:
        try:
            work_minutes = int(work_entry.get())
            break_minutes = int(break_entry.get())
            work_duration = work_minutes * 60
            break_duration = break_minutes * 60
        except ValueError:
            update_time_label("Err")
            return
        time_left = work_duration
        timer_running = True
        countdown(time_left)

def pause_timer():
    global timer_running, timer_id
    timer_running = False
    if timer_id:
        root.after_cancel(timer_id)

def reset_timer():
    global timer_running, time_left, timer_id
    timer_running = False
    if timer_id:
        root.after_cancel(timer_id)
    time_left = work_duration
    update_time_label(f"{work_entry.get().zfill(2)}:00")

def resume_timer():
    global timer_running
    if not timer_running:
        timer_running = True
        countdown(time_left)

def countdown(seconds):
    global time_left, timer_running, timer_id
    if seconds > 0 and timer_running:
        minutes, sec = divmod(seconds, 60)
        update_time_label(f"{minutes:02}:{sec:02}")
        time_left = seconds - 1
        timer_id = root.after(1000, countdown, time_left)
    else:
        if timer_running:
            update_time_label("00:00")
            play_sound()
            notify_user("Pomodoro Complete!", "Time for a break!")
            log_session("Work")
            start_break(break_duration)

def start_break(seconds):
    global time_left
    time_left = seconds
    countdown_break(time_left)

def countdown_break(seconds):
    global time_left, timer_running, timer_id
    if seconds > 0:
        minutes, sec = divmod(seconds, 60)
        update_time_label(f"Break: {minutes:02}:{sec:02}")
        time_left = seconds - 1
        timer_id = root.after(1000, countdown_break, time_left)
    else:
        play_sound()
        notify_user("Break Over!", "Time to get back to work!")
        log_session("Break")
        reset_timer()

# --- Helpers ---

def update_time_label(time_str):
    time_label.config(text=time_str)

def play_sound():
    try:
        pygame.mixer.music.load("alarm_sound.mp3")
        pygame.mixer.music.play()
    except:
        print("Sound file not found.")

def notify_user(title, message):
    notification.notify(
        title=title,
        message=message,
        timeout=4
    )

def log_session(session_type="Work"):
    with open("session_log.txt", "a") as f:
        f.write(f"{datetime.date.today()},{session_type}\n")
    update_stats_display()

def get_today_stats():
    count = 0
    today = str(datetime.date.today())
    try:
        with open("session_log.txt", "r") as f:
            for line in f:
                if line.startswith(today) and "Work" in line:
                    count += 1
    except FileNotFoundError:
        pass
    return count

def update_stats_display():
    stats = get_today_stats()
    stats_label.config(text=f"Pomodoros Today: {stats}")

# --- UI Setup ---

root = tk.Tk()
root.title("Pomodoro Timer")
root.geometry("360x300")

# Timer Label
time_label = tk.Label(root, text="40:00", font=("Arial", 36))
time_label.pack(pady=15)

# Inputs
input_frame = tk.Frame(root)
input_frame.pack()

tk.Label(input_frame, text="Work (min):").grid(row=0, column=0)
work_entry = tk.Entry(input_frame, width=5)
work_entry.insert(0, "40")
work_entry.grid(row=0, column=1, padx=5)

tk.Label(input_frame, text="Break (min):").grid(row=0, column=2)
break_entry = tk.Entry(input_frame, width=5)
break_entry.insert(0, "10")
break_entry.grid(row=0, column=3, padx=5)

# Stats
stats_label = tk.Label(root, text="Pomodoros Today: 0", font=("Arial", 12))
stats_label.pack(pady=10)
update_stats_display()

# Buttons
btn_frame = tk.Frame(root)
btn_frame.pack()

tk.Button(btn_frame, text="Start", font=("Arial", 12), command=start_timer).grid(row=0, column=0, padx=5)
tk.Button(btn_frame, text="Pause", font=("Arial", 12), command=pause_timer).grid(row=0, column=1, padx=5)
tk.Button(btn_frame, text="Resume", font=("Arial", 12), command=resume_timer).grid(row=0, column=2, padx=5)
tk.Button(btn_frame, text="Reset", font=("Arial", 12), command=reset_timer).grid(row=0, column=3, padx=5)

# Run the app
root.mainloop()
