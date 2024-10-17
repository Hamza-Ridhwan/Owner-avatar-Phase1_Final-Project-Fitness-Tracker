document.addEventListener('DOMContentLoaded', () => {
    const workoutForm = document.getElementById('workout-form');
    const workoutList = document.getElementById('workout-list');
    const searchInput = document.getElementById('search-input');

    let workouts = [];

    // Fetch existing workouts from the server
    fetchWorkouts();

    // Handle workout form submission
    workoutForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const exerciseType = document.getElementById('exercise-type').value;
        const duration = document.getElementById('duration').value;
        const calories = document.getElementById('calories').value;

        const newWorkout = { exerciseType, duration, calories };
        createWorkout(newWorkout);

        workoutForm.reset();
    });

    // Search for workouts by exercise type using the filter() method
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredWorkouts = workouts.filter(workout => 
            workout.exerciseType.toLowerCase().includes(searchTerm)
        );
        displayWorkouts(filteredWorkouts);
    });

    // Fetch all workouts (READ operation)
    function fetchWorkouts() {
        fetch('http://localhost:3000/workouts')
            .then((response) => response.json())
            .then((data) => {
                workouts = data;  // Store all workouts in the array
                displayWorkouts(workouts); // Display all workouts initially
            });
    }

    // Create a new workout (CREATE operation)
    function createWorkout(workout) {
        fetch('http://localhost:3000/workouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workout)
        })
        .then(response => response.json())
        .then(data => {
            workouts.push(data); // Add the new workout to the array
            displayWorkouts(workouts); // Update the display
        });
    }

    // Display workouts in the list
    function displayWorkouts(workoutsToDisplay) {
        workoutList.innerHTML = '';  // Clear the existing list
        workoutsToDisplay.forEach(workout => {
            const workoutItem = document.createElement('li');
            workoutItem.classList.add('workout-item');
            workoutItem.id = `workout-${workout.id}`;
            workoutItem.innerHTML = `
                <span class="workout-details">${workout.exerciseType} - ${workout.duration} minutes, ${workout.calories} calories burned.</span>
                <div>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            workoutList.appendChild(workoutItem);

            // Handle edit button click (UPDATE operation)
            workoutItem.querySelector('.edit-btn').addEventListener('click', () => {
                const updatedWorkout = {
                    exerciseType: prompt('New Exercise Type:', workout.exerciseType),
                    duration: prompt('New Duration (minutes):', workout.duration),
                    calories: prompt('New Calories Burned:', workout.calories)
                };
                updateWorkout(workout.id, updatedWorkout);
            });

            // Handle delete button click (DELETE operation)
            workoutItem.querySelector('.delete-btn').addEventListener('click', () => {
                deleteWorkout(workout.id);
            });
        });
    }


    // Update workout details (UPDATE operation)
    function updateWorkout(id, updatedWorkout) {
        fetch(`http://localhost:3000/workouts/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedWorkout)
        })
        .then(response => response.json())
        .then(() => {
            const workoutIndex = workouts.findIndex(workout => workout.id === id);
            workouts[workoutIndex] = { ...workouts[workoutIndex], ...updatedWorkout };
            displayWorkouts(workouts);
        });
    }

    // Delete workout (DELETE operation)
    function deleteWorkout(id) {
        fetch(`http://localhost:3000/workouts/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            workouts = workouts.filter(workout => workout.id !== id);
            displayWorkouts(workouts);
        });
    }
});
