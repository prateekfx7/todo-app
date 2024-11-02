let tasks = [];
        let userTimeZone;
        const GOOGLE_API_KEY = 'YOUR_API_KEY'; // Replace with your actual Google API key

        function addTask() {
            const input = document.getElementById('task-input');
            const taskText = input.value.trim();
            
            if (taskText) {
                const task = {
                    id: Date.now(),
                    text: taskText,
                    completed: false,
                    createdAt: new Date(),
                    completedAt: null
                };
                
                tasks.push(task);
                input.value = '';
                renderTasks();
            }
        }

        function toggleTask(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                task.completedAt = task.completed ? new Date() : null;
                renderTasks();
            }
        }

        function deleteTask(id) {
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
        }

        function editTask(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                const newText = prompt('Edit task:', task.text);
                if (newText !== null && newText.trim() !== '') {
                    task.text = newText.trim();
                    renderTasks();
                }
            }
        }

        function formatDate(date) {
            return new Date(date).toLocaleString();
        }

        function renderTasks() {
            const pendingContainer = document.getElementById('pending-tasks');
            const completedContainer = document.getElementById('completed-tasks');
            
            pendingContainer.innerHTML = '';
            completedContainer.innerHTML = '';

            tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = 'task-item';
                
                taskElement.innerHTML = `
                    <div>
                        <input type="checkbox" ${task.completed ? 'checked' : ''} 
                            onclick="toggleTask(${task.id})">
                        <span>${task.text}</span>
                        <div class="timestamp">
                            Created: ${formatDate(task.createdAt)}
                            ${task.completedAt ? '<br>Completed: ' + formatDate(task.completedAt) : ''}
                        </div>
                    </div>
                    <div>
                        <button onclick="editTask(${task.id})">Edit</button>
                        <button onclick="deleteTask(${task.id})">Delete</button>
                    </div>
                `;

                if (task.completed) {
                    completedContainer.appendChild(taskElement);
                } else {
                    pendingContainer.appendChild(taskElement);
                }
            });
        }

        async function getUserTimeZone() {
            try {
                // First get user's coordinates
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                
                const { latitude, longitude } = position.coords;
                const timestamp = Math.floor(Date.now() / 1000);
                
                // Call Google's Timezone API
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timestamp}&key=${GOOGLE_API_KEY}`
                );
                const data = await response.json();
                
                if (data.status === 'OK') {
                    userTimeZone = data.timeZoneId;
                    updateDateTime();
                }
            } catch (error) {
                console.error('Error getting timezone:', error);
            }
        }

        function updateDateTime() {
            const now = new Date();
            const options = { timeZone: userTimeZone || 'UTC' };
            
            // Update clock
            document.getElementById('clock').textContent = now.toLocaleTimeString('en-US', options);
            
            // Update date
            const dateOptions = {
                timeZone: userTimeZone || 'UTC',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            document.getElementById('date').textContent = now.toLocaleDateString('en-US', dateOptions);
        }

        getUserTimeZone();
        setInterval(updateDateTime, 1000);