import pandas as pd
from keras import Model
from keras._tf_keras.keras.layers import Dense,Dropout,BatchNormalization,Add,Input
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Load dataset
data = pd.read_csv('StudentPerformanceFactors.csv')

# Display the first few rows
print(data.head())

# Select relevant features and target variable
# Here we choose a subset of columns that could be relevant for prediction
features = ['Hours_Studied',  'Attendance', 'Sleep_Hours', 'Previous_Scores', 'Tutoring_Sessions', 'Physical_Activity']

target = 'Exam_Score'

X = data[features]
y = data[target]

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Standardize the features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Build the neural network model
# ------------------------------
# Define the input layer
input_layer = Input(shape=(6,))

# First block
x = Dense(128, activation='relu')(input_layer)
x = BatchNormalization()(x)
x = Dropout(0.3)(x)

# Second block
x = Dense(256, activation='relu')(x)
x = BatchNormalization()(x)
x = Dropout(0.3)(x)

# Third block with residual connection
residual = Dense(256, activation='relu')(x)
residual = BatchNormalization()(residual)
x = Dense(256, activation='relu')(x)
x = BatchNormalization()(x)
x = Add()([x, residual])  # Residual connection
x = Dropout(0.3)(x)

# Fourth block
x = Dense(128, activation='relu')(x)
x = BatchNormalization()(x)
x = Dropout(0.3)(x)

# Fifth block
x = Dense(64, activation='relu')(x)
x = BatchNormalization()(x)

# Output layer
output_layer = Dense(1)(x)  # Output for regression

# Create the model
model = Model(inputs=input_layer, outputs=output_layer)

# Summary of the model
# model.summary()

# Compile the model
model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mean_absolute_error'])

# -----------------------------------------------------------------------------------------------------
# Train the model
# model.fit(X_train, y_train, epochs=500, batch_size=10, validation_split=0.2)
from tqdm import tqdm
from colorama import Fore, Back, Style, init
from keras._tf_keras.keras.callbacks import Callback

# Initialize colorama
init(autoreset=True)

class EpochProgressBar(Callback):
    def __init__(self, epochs):
        super().__init__()
        self.epochs = epochs
        self.progress_bar = None

    def on_train_begin(self, logs=None):
        print("\n")
        print("\t" + "*" * 50)
        print("\t" + "*" + " " * 48 + "*")
        print("\t" + "*" + "\033[92m" + " Starting Epoches ".center(48, " ") + "\033[0m" + "*")
        print("\t" + "*" + " " * 48 + "*")
        print("\t" + "*" * 50)
        print("\n")
        self.progress_bar = tqdm(total=self.epochs, bar_format="{l_bar}%s{bar}%s{r_bar}" % (Fore.CYAN, Fore.RESET))

    def on_epoch_end(self, epoch, logs=None):
        self.progress_bar.update(1)
        self.progress_bar.set_description(f"Epoch {epoch+1}/{self.epochs}")
        
        # Add some flair every 50 epochs
        if (epoch + 1) % 50 == 0:
            self.progress_bar.write(f"{Fore.GREEN}✨ Completed {epoch+1} epochs! {Style.RESET_ALL}")

    def on_train_end(self, logs=None):
        self.progress_bar.close()
        print(f"\n{Back.GREEN}{Fore.BLACK} Training Complete! {Style.RESET_ALL}")
        print(f"\n{Fore.YELLOW}🎉 Model successfully trained over {self.epochs} epochs! 🎉{Style.RESET_ALL}")

# Create an instance of the custom callback
epochs = 500
epoch_progress_bar = EpochProgressBar(epochs)

# Modify your model.fit() call to include the callback
history = model.fit(
    X_train, 
    y_train, 
    epochs=epochs, 
    batch_size=10, 
    validation_split=0.2,
    callbacks=[epoch_progress_bar],
    verbose=0  # Set to 0 to disable the default progress bar
)

# -----------------------------------------------------------------------------------------------------
# ------------------------------

# Evaluate the model
loss, mae = model.evaluate(X_test, y_test)
print(f'Mean Absolute Error on Test Set: {mae}')

# Make predictions
predictions = model.predict(X_test)

# Display the first few predictions
print(predictions[:5])

model.save('stu_model.keras')
print("file saved successfully")
