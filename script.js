
        // Photo editor variables
        let originalImage = null;
        let editedImage = null;
        let canvas = null;
        let ctx = null;
        let photoZoom = 1;
        let photoX = 0;
        let photoY = 0;
        let photoRotation = 0; // New rotation variable
        let isDragging = false;
        let lastMouseX = 0;
        let lastMouseY = 0;

        // Initialize photo editor
        function initPhotoEditor() {
            canvas = document.getElementById('editorCanvas');
            ctx = canvas.getContext('2d');
            
            // Add mouse event listeners for dragging
            canvas.addEventListener('mousedown', startDrag);
            canvas.addEventListener('mousemove', drag);
            canvas.addEventListener('mouseup', stopDrag);
            canvas.addEventListener('mouseleave', stopDrag);
            canvas.addEventListener('wheel', handleWheel);
            
            // Add touch event listeners for mobile
            canvas.addEventListener('touchstart', handleTouch);
            canvas.addEventListener('touchmove', handleTouch);
            canvas.addEventListener('touchend', stopDrag);
        }

        function handleWheel(e) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            photoZoom = Math.max(0.1, Math.min(3, photoZoom + delta));
            document.getElementById('zoomSlider').value = photoZoom;
            updateZoomValue();
            drawPhoto();
            updateCanvasStats();
        }

        function handleTouch(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent(e.type.replace('touch', 'mouse'), {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        }

        function startDrag(e) {
            isDragging = true;
            const rect = canvas.getBoundingClientRect();
            lastMouseX = e.clientX - rect.left;
            lastMouseY = e.clientY - rect.top;
        }

        function drag(e) {
            if (!isDragging) return;
            
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const deltaX = mouseX - lastMouseX;
            const deltaY = mouseY - lastMouseY;
            
            photoX += deltaX;
            photoY += deltaY;
            
            lastMouseX = mouseX;
            lastMouseY = mouseY;
            
            drawPhoto();
            updateCanvasStats();
        }

        function stopDrag() {
            isDragging = false;
        }

        function openPhotoEditor(imageData) {
            originalImage = new Image();
            originalImage.onload = function() {
                // Reset photo parameters
                photoZoom = 1;
                photoRotation = 0;
                photoX = (canvas.width - originalImage.width) / 2;
                photoY = (canvas.height - originalImage.height) / 2;
                
                // Update sliders
                document.getElementById('zoomSlider').value = photoZoom;
                document.getElementById('rotationSlider').value = photoRotation;
                updateZoomValue();
                updateRotationValue();
                
                // Draw photo
                drawPhoto();
                
                // Show modal
                document.getElementById('photoEditorModal').classList.add('active');
                updateCanvasStats();
            };
            originalImage.src = imageData;
        }

        function closePhotoEditor() {
            document.getElementById('photoEditorModal').classList.remove('active');
        }

        function drawPhoto() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (originalImage) {
                // Save the current context
                ctx.save();
                
                // Calculate scaled dimensions
                const scaledWidth = originalImage.width * photoZoom;
                const scaledHeight = originalImage.height * photoZoom;
                
                // Calculate center point for rotation
                const centerX = photoX + scaledWidth / 2;
                const centerY = photoY + scaledHeight / 2;
                
                // Move to center, rotate, then move back
                ctx.translate(centerX, centerY);
                ctx.rotate(photoRotation * Math.PI / 180);
                ctx.translate(-centerX, -centerY);
                
                // Draw image
                ctx.drawImage(originalImage, photoX, photoY, scaledWidth, scaledHeight);
                
                // Restore the context
                ctx.restore();
            }
        }

        function zoomIn() {
            photoZoom = Math.min(photoZoom + 0.05, 3);
            document.getElementById('zoomSlider').value = photoZoom;
            updateZoomValue();
            drawPhoto();
            updateCanvasStats();
        }

        function zoomOut() {
            photoZoom = Math.max(photoZoom - 0.05, 0.1);
            document.getElementById('zoomSlider').value = photoZoom;
            updateZoomValue();
            drawPhoto();
            updateCanvasStats();
        }

        function setZoom(value) {
            photoZoom = parseFloat(value);
            updateZoomValue();
            drawPhoto();
            updateCanvasStats();
        }

        function updateZoomValue() {
            document.getElementById('zoomValue').textContent = Math.round(photoZoom * 100) + '%';
        }

        // New rotation functions
        function rotateLeft() {
            photoRotation = (photoRotation - 15) % 360;
            if (photoRotation < 0) photoRotation += 360;
            document.getElementById('rotationSlider').value = photoRotation;
            updateRotationValue();
            drawPhoto();
            updateCanvasStats();
        }

        function rotateRight() {
            photoRotation = (photoRotation + 15) % 360;
            document.getElementById('rotationSlider').value = photoRotation;
            updateRotationValue();
            drawPhoto();
            updateCanvasStats();
        }

        function setRotation(value) {
            photoRotation = parseFloat(value) % 360;
            document.getElementById('rotationSlider').value = photoRotation;
            updateRotationValue();
            drawPhoto();
            updateCanvasStats();
        }

        function updateRotationValue() {
            document.getElementById('rotationValue').textContent = Math.round(photoRotation) + '°';
        }

        function movePhoto(direction) {
            const moveAmount = 10;
            
            switch(direction) {
                case 'up': photoY -= moveAmount; break;
                case 'down': photoY += moveAmount; break;
                case 'left': photoX -= moveAmount; break;
                case 'right': photoX += moveAmount; break;
                case 'up-left': photoY -= moveAmount; photoX -= moveAmount; break;
                case 'up-right': photoY -= moveAmount; photoX += moveAmount; break;
                case 'down-left': photoY += moveAmount; photoX -= moveAmount; break;
                case 'down-right': photoY += moveAmount; photoX += moveAmount; break;
            }
            
            drawPhoto();
            updateCanvasStats();
        }

        function centerPhoto() {
            if (originalImage) {
                const scaledWidth = originalImage.width * photoZoom;
                const scaledHeight = originalImage.height * photoZoom;
                photoX = (canvas.width - scaledWidth) / 2;
                photoY = (canvas.height - scaledHeight) / 2;
                drawPhoto();
                updateCanvasStats();
            }
        }

        function resetPhoto() {
            if (originalImage) {
                photoZoom = 1;
                photoRotation = 0;
                photoX = (canvas.width - originalImage.width) / 2;
                photoY = (canvas.height - originalImage.height) / 2;
                document.getElementById('zoomSlider').value = photoZoom;
                document.getElementById('rotationSlider').value = photoRotation;
                updateZoomValue();
                updateRotationValue();
                drawPhoto();
                updateCanvasStats();
            }
        }

        function resetPosition() {
            if (originalImage) {
                const scaledWidth = originalImage.width * photoZoom;
                const scaledHeight = originalImage.height * photoZoom;
                photoX = (canvas.width - scaledWidth) / 2;
                photoY = (canvas.height - scaledHeight) / 2;
                drawPhoto();
                updateCanvasStats();
            }
        }

        function updateCanvasStats() {
            const stats = `Zoom: ${Math.round(photoZoom * 100)}% | Rotation: ${Math.round(photoRotation)}° | Position: ${Math.round(photoX)}, ${Math.round(photoY)}`;
            document.getElementById('canvasStats').textContent = stats;
        }

        function applyPhotoEdits() {
            if (!originalImage) return;
            
            // Create a new canvas for the final image
            const finalCanvas = document.createElement('canvas');
            const finalCtx = finalCanvas.getContext('2d');
            
            // Set the final canvas size to match ID card photo dimensions
            finalCanvas.width = 120;
            finalCanvas.height = 140;
            
            // Calculate the crop area (red overlay area in the editor)
            const cropWidth = 120;
            const cropHeight = 140;
            const cropX = (canvas.width - cropWidth) / 2;
            const cropY = (canvas.height - cropHeight) / 2;
            
            // Create a temporary canvas to render the transformed image
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            
            // Render the transformed image to temp canvas
            const scaledWidth = originalImage.width * photoZoom;
            const scaledHeight = originalImage.height * photoZoom;
            const centerX = photoX + scaledWidth / 2;
            const centerY = photoY + scaledHeight / 2;
            
            tempCtx.save();
            tempCtx.translate(centerX, centerY);
            tempCtx.rotate(photoRotation * Math.PI / 180);
            tempCtx.translate(-centerX, -centerY);
            tempCtx.drawImage(originalImage, photoX, photoY, scaledWidth, scaledHeight);
            tempCtx.restore();
            
            // Fill with white background first
            finalCtx.fillStyle = '#ffffff';
            finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            
            // Copy the crop area from temp canvas to final canvas
            finalCtx.drawImage(
                tempCanvas,
                cropX, cropY, cropWidth, cropHeight,
                0, 0, finalCanvas.width, finalCanvas.height
            );
            
            // Convert to data URL and apply to photo preview
            const croppedImageData = finalCanvas.toDataURL('image/jpeg', 0.95);
            editedImage = croppedImageData;
            
            const photoPreview = document.getElementById('photoPreview');
            const photoPlaceholder = document.getElementById('photoPlaceholder');
            
            photoPreview.src = editedImage;
            photoPreview.style.display = 'block';
            photoPlaceholder.style.display = 'none';
            
            closePhotoEditor();
        }

        // Handle photo upload - Modified to open editor
        document.getElementById('photo').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Initialize editor if not done
                    if (!canvas) {
                        initPhotoEditor();
                    }
                    
                    // Open photo editor with the uploaded image
                    openPhotoEditor(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });

        // Generate card function
        function generateCard() {
            const idNumber = document.getElementById('idNumber').value;
            const name = document.getElementById('name').value;
            const designation = document.getElementById('designation').value;
            const issueDate = document.getElementById('issueDate').value;
            const validTill = document.getElementById('validTill').value;
            const probation = document.getElementById('probation').value;
            const showEmail = document.querySelector('input[name="showEmail"]:checked').value;

            // Update preview
            document.getElementById('previewId').textContent = idNumber || 'Fo_BHS_00566';
            document.getElementById('previewName').textContent = name || 'Employee Name';
            document.getElementById('previewDesignation').textContent = designation || 'Designation';
            
            // Format dates
            if (issueDate) {
                const formattedIssueDate = new Date(issueDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                });
                document.getElementById('previewIssueDate').textContent = formattedIssueDate;
            }
            
            if (validTill) {
                const formattedValidTill = new Date(validTill).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                });
                document.getElementById('previewValidTill').textContent = formattedValidTill;
            }
            
            document.getElementById('previewProbation').textContent = probation || '';
            
            // Handle email visibility
            const emailElement = document.getElementById('companyEmail');
            if (showEmail === 'yes') {
                emailElement.style.display = 'block';
            } else {
                emailElement.style.display = 'none';
            }
        }

        // Auto-update preview as user types
        document.getElementById('idNumber').addEventListener('input', generateCard);
        document.getElementById('name').addEventListener('input', generateCard);
        document.getElementById('designation').addEventListener('input', generateCard);
        document.getElementById('issueDate').addEventListener('change', generateCard);
        document.getElementById('validTill').addEventListener('change', generateCard);
        document.getElementById('probation').addEventListener('change', generateCard);
        
        // Add event listeners for radio buttons
        document.querySelectorAll('input[name="showEmail"]').forEach(radio => {
            radio.addEventListener('change', generateCard);
        });

        // Set default dates
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);

        document.getElementById('issueDate').value = today.toISOString().split('T')[0];
        document.getElementById('validTill').value = nextMonth.toISOString().split('T')[0];
        
        // Initial card generation
        generateCard();

        // Download as Image function
        async function downloadAsImage() {
            const idCard = document.getElementById('idCard');
            const downloadBtn = document.querySelector('.download-btn');
            
            // Disable button and show loading
            downloadBtn.disabled = true;
            downloadBtn.textContent = 'Generating...';
            
            try {
                const canvas = await html2canvas(idCard, {
                    scale: 3, // Higher resolution
                    backgroundColor: '#ffffff',
                    useCORS: true,
                    allowTaint: true,
                    width: 370,
                    height: 609
                });
                
                // Create download link
                const link = document.createElement('a');
                link.download = `${document.getElementById('previewName').textContent.replace(/\s+/g, '_')}_ID_Card.png`;
                link.href = canvas.toDataURL('image/png', 1.0);
                link.click();
                
            } catch (error) {
                alert('Error generating image. Please try again.');
                console.error('Error:', error);
            } finally {
                // Re-enable button
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Download as Image';
            }
        }

        // Download as PDF function
        async function downloadAsPDF() {
            const idCard = document.getElementById('idCard');
            const pdfBtn = document.querySelector('.download-btn.pdf');
            
            // Disable button and show loading
            pdfBtn.disabled = true;
            pdfBtn.textContent = 'Generating...';
            
            try {
                const canvas = await html2canvas(idCard, {
                    scale: 3, // Higher resolution
                    backgroundColor: '#ffffff',
                    useCORS: true,
                    allowTaint: true,
                    width: 370,
                    height: 609
                });
                
                const imgData = canvas.toDataURL('image/png', 1.0);
                
                // Create PDF
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: [85, 125] // ID card size in mm
                });
                
                // Add image to PDF
                pdf.addImage(imgData, 'PNG', 2, 2, 81, 121);
                
                // Download PDF
                const fileName = `${document.getElementById('previewName').textContent.replace(/\s+/g, '_')}_ID_Card.pdf`;
                pdf.save(fileName);
                
            } catch (error) {
                alert('Error generating PDF. Please try again.');
                console.error('Error:', error);
            } finally {
                // Re-enable button
                pdfBtn.disabled = false;
                pdfBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Download as PDF';
            }
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all nav items
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to clicked item
                this.classList.add('active');
            });
        });
   