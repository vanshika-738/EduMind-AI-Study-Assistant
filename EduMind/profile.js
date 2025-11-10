// Profile Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user data
    const userData = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"name": "Student User"}');
    
    // Set initial user data
    initializeUserData();
    
    // Initialize activity chart
    initializeActivityChart();
    
    // Modal elements
    const editProfileModal = document.getElementById('editProfileModal');
    const imageUploadModal = document.getElementById('imageUploadModal');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const modalClose = document.getElementById('modalClose');
    const imageModalClose = document.getElementById('imageModalClose');
    const cancelEdit = document.getElementById('cancelEdit');
    const cancelUpload = document.getElementById('cancelUpload');
    
    // Cover and profile picture edit buttons
    const coverEditBtn = document.getElementById('coverEditBtn');
    const profileEditBtn = document.getElementById('profileEditBtn');
    
    // Image upload elements
    const imageInput = document.getElementById('imageInput');
    const uploadFromDevice = document.getElementById('uploadFromDevice');
    const takePhoto = document.getElementById('takePhoto');
    const removePhoto = document.getElementById('removePhoto');
    const saveImage = document.getElementById('saveImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const imageModalTitle = document.getElementById('imageModalTitle');
    
    // Track current image type being edited
    let currentImageType = 'profile'; // 'profile' or 'cover'
    
    // Event Listeners
    editProfileBtn.addEventListener('click', openEditProfileModal);
    modalClose.addEventListener('click', closeEditProfileModal);
    imageModalClose.addEventListener('click', closeImageUploadModal);
    cancelEdit.addEventListener('click', closeEditProfileModal);
    cancelUpload.addEventListener('click', closeImageUploadModal);
    
    // Cover and profile picture editing
    coverEditBtn.addEventListener('click', () => openImageUploadModal('cover'));
    profileEditBtn.addEventListener('click', () => openImageUploadModal('profile'));
    
    // Image upload options
    uploadFromDevice.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleImageUpload);
    takePhoto.addEventListener('click', takePhotoWithCamera);
    removePhoto.addEventListener('click', removeCurrentPhoto);
    saveImage.addEventListener('click', saveImageChanges);
    
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', saveProfileChanges);
    
    // Edit section buttons
    document.querySelectorAll('.edit-section-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            editSection(section);
        });
    });
    
    // Initialize user data
    function initializeUserData() {
        // Set user name
        document.getElementById('userName').textContent = userData.name || currentUser.name;
        document.getElementById('editName').value = userData.name || currentUser.name;
        
        // Set user bio
        document.getElementById('userBio').textContent = userData.bio || 'Passionate learner | Computer Science Student | AI Enthusiast';
        document.getElementById('editBio').value = userData.bio || 'Passionate learner | Computer Science Student | AI Enthusiast';
        
        // Set about information
        document.getElementById('educationValue').textContent = userData.education || 'Computer Science Student at University';
        document.getElementById('editEducation').value = userData.education || 'Computer Science Student at University';
        
        document.getElementById('locationValue').textContent = userData.location || 'New York, USA';
        document.getElementById('editLocation').value = userData.location || 'New York, USA';
        
        document.getElementById('interestsValue').textContent = userData.interests || 'AI, Machine Learning, Web Development, Data Science';
        document.getElementById('editInterests').value = userData.interests || 'AI, Machine Learning, Web Development, Data Science';
        
        // Set joined date
        document.getElementById('joinedValue').textContent = userData.joined || 'January 2023';
        
        // Set profile and cover images if available
        if (userData.profileImage) {
            document.getElementById('profileImage').src = userData.profileImage;
            document.getElementById('userAvatar').src = userData.profileImage;
        }
        
        if (userData.coverImage) {
            document.getElementById('coverImage').src = userData.coverImage;
        }
    }
    
    // Initialize activity chart
    function initializeActivityChart() {
        const ctx = document.getElementById('activityChart').getContext('2d');
        const activityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Study Time (hours)',
                    data: [2.5, 3, 2, 4, 3.5, 2, 3],
                    backgroundColor: '#00bcd4',
                    borderRadius: 5,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + 'h';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Open edit profile modal
    function openEditProfileModal() {
        editProfileModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Close edit profile modal
    function closeEditProfileModal() {
        editProfileModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Open image upload modal
    function openImageUploadModal(type) {
        currentImageType = type;
        imageUploadModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Set modal title based on type
        imageModalTitle.textContent = type === 'profile' ? 'Change Profile Picture' : 'Change Cover Photo';
        
        // Reset preview
        imagePreview.classList.remove('active');
        saveImage.disabled = true;
    }
    
    // Close image upload modal
    function closeImageUploadModal() {
        imageUploadModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Reset file input
        imageInput.value = '';
    }
    
    // Handle image upload from device
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                imagePreview.classList.add('active');
                saveImage.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    }
    
    // Take photo with camera (simulated for demo)
    function takePhotoWithCamera() {
        alert('In a real application, this would open your camera to take a photo. For this demo, please use "Upload from Device" instead.');
    }
    
    // Remove current photo
    function removeCurrentPhoto() {
        if (currentImageType === 'profile') {
            // Set default profile image
            previewImage.src = 'https://ui-avatars.com/api/?name=Student+User&background=00bcd4&color=fff&size=200';
        } else {
            // Set default cover image
            previewImage.src = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
        }
        
        imagePreview.classList.add('active');
        saveImage.disabled = false;
    }
    
    // Save image changes
    function saveImageChanges() {
        const imageUrl = previewImage.src;
        
        if (currentImageType === 'profile') {
            // Update profile image
            document.getElementById('profileImage').src = imageUrl;
            document.getElementById('userAvatar').src = imageUrl;
            
            // Save to user data
            if (!userData.profileImage || imageUrl !== 'https://ui-avatars.com/api/?name=Student+User&background=00bcd4&color=fff&size=200') {
                userData.profileImage = imageUrl;
            }
        } else {
            // Update cover image
            document.getElementById('coverImage').src = imageUrl;
            
            // Save to user data
            if (!userData.coverImage || imageUrl !== 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80') {
                userData.coverImage = imageUrl;
            }
        }
        
        // Save user data to localStorage
        localStorage.setItem('userProfile', JSON.stringify(userData));
        
        // Show success message
        showNotification('Image updated successfully!', 'success');
        
        // Close modal
        closeImageUploadModal();
    }
    
    // Save profile changes
    function saveProfileChanges(event) {
        event.preventDefault();
        
        // Get form values
        const name = document.getElementById('editName').value;
        const bio = document.getElementById('editBio').value;
        const education = document.getElementById('editEducation').value;
        const location = document.getElementById('editLocation').value;
        const interests = document.getElementById('editInterests').value;
        
        // Update user data
        userData.name = name;
        userData.bio = bio;
        userData.education = education;
        userData.location = location;
        userData.interests = interests;
        
        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(userData));
        
        // Update UI
        document.getElementById('userName').textContent = name;
        document.getElementById('userBio').textContent = bio;
        document.getElementById('educationValue').textContent = education;
        document.getElementById('locationValue').textContent = location;
        document.getElementById('interestsValue').textContent = interests;
        
        // Update current user name
        currentUser.name = name;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Show success message
        showNotification('Profile updated successfully!', 'success');
        
        // Close modal
        closeEditProfileModal();
    }
    
    // Edit section (for future implementation)
    function editSection(section) {
        switch(section) {
            case 'about':
                openEditProfileModal();
                break;
            case 'goals':
                alert('Goal editing functionality would be implemented here.');
                break;
            default:
                alert(`Editing ${section} section would be implemented here.`);
        }
    }
    
    // Show notification
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide and remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Add notification styles dynamically
    const notificationStyles = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--card-bg);
            border-radius: 10px;
            box-shadow: var(--shadow);
            padding: 15px 20px;
            z-index: 3000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            border-left: 4px solid #4caf50;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.error {
            border-left-color: #f44336;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification-content i {
            font-size: 1.2rem;
        }
        
        .notification.success .notification-content i {
            color: #4caf50;
        }
        
        .notification.error .notification-content i {
            color: #f44336;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);
    
    // Goal management functionality
    document.querySelectorAll('.goal-edit').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const goalItem = this.closest('.goal-item');
            const goalTitle = goalItem.querySelector('h3').textContent;
            const goalDescription = goalItem.querySelector('p').textContent;
            
            // In a real app, this would open an edit modal
            alert(`Editing goal: ${goalTitle}\n\nThis would open an edit form in a real application.`);
        });
    });
    
    document.querySelectorAll('.goal-delete').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const goalItem = this.closest('.goal-item');
            const goalTitle = goalItem.querySelector('h3').textContent;
            
            if (confirm(`Are you sure you want to delete the goal "${goalTitle}"?`)) {
                goalItem.style.opacity = '0';
                goalItem.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    goalItem.remove();
                    showNotification('Goal deleted successfully!', 'success');
                }, 300);
            }
        });
    });
    
    document.querySelector('.add-goal-btn').addEventListener('click', function() {
        // In a real app, this would open a modal to add a new goal
        alert('This would open a form to add a new goal in a real application.');
    });
});