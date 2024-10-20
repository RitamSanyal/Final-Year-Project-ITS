from sklearn.preprocessing import StandardScaler
from keras._tf_keras.keras.models import load_model
import pandas as pd


# Load the pre-trained model
model = load_model('stu_model.keras')

# Load the training data to get the scaler
data = pd.read_csv('StudentPerformanceFactors.csv')
features = ['Hours_Studied',  'Attendance', 'Sleep_Hours', 'Previous_Scores', 'Tutoring_Sessions', 'Physical_Activity']
X_train = data[features]

# Fit the scaler on the training data
scaler = StandardScaler()
scaler.fit(X_train)


# Function to scale user input features
def scale_user_input(user_input, scaler):
    scaled_features = scaler.transform([user_input])
    return scaled_features


def get_user_input():
    print("\n")
    print("\t" + "*" * 50)
    print("\t" + "*" + " " * 48 + "*")
    print("\t" + "*" + "\033[92m" + " Enter a value below ".center(48, " ") + "\033[0m" + "*")
    print("\t" + "*" + " " * 48 + "*")
    print("\t" + "*" * 50)
    print("\n")
    Hours_Studied = float(input("Enter study time: "))
    Attendance = int(input("Enter number of Attendance: "))
    Sleep_Hours = int(input("Enter number of Sleep_Hours: "))
    Previous_Scores = float(input("Enter Previous_Scores: "))
    Tutoring_Sessions = int(input("Enter number of Tutoring_Sessions: "))
    Physical_Activity =  int(input("Enter number of Physical_Activity: "))
    return [Hours_Studied, Attendance, Sleep_Hours, Previous_Scores, Tutoring_Sessions, Physical_Activity]


# Get user input
user_input = get_user_input()

# Scale user input features
scaled_input = scale_user_input(user_input, scaler)

# Predict the grade5
predicted_grade = model.predict(scaled_input)[0][0]

# Print the predicted grade
print(f"Predicted final grade: {predicted_grade:.2f}")
