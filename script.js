document.addEventListener('DOMContentLoaded', () => {
    // API URL for fetching data
    const API_URL = 'https://script.google.com/macros/s/AKfycby8-U1T8a8xnC-HxOPQT-oJY5pMIE0jBPiF0Yx-vTdHib6kxDbp9y0ynpo0udI2pJpk/exec';
    
    // DOM elements for loader
    const main = document.querySelector('main');
    let loader;

    // Create and show loader
    function showLoader() {
        // Create loader if it doesn't exist
        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'loader-container';
            loader.innerHTML = `
                <div class="loader"></div>
                <p class="loader-text">LOADING DATA...</p>
            `;
            
            // Insert loader before main content
            if (main) {
                main.style.opacity = '0.2';
                document.body.insertBefore(loader, main);
            } else {
                document.body.appendChild(loader);
            }
        } else {
            loader.style.display = 'flex';
            if (main) main.style.opacity = '0.2';
        }
    }

    // Hide loader
    function hideLoader() {
        if (loader) {
            loader.style.display = 'none';
            if (main) main.style.opacity = '1';
        }
    }

    // Fetch data from API with caching
    async function fetchData() {
        // Check if data exists in localStorage and is not expired
        const cachedData = localStorage.getItem('portfolioData');
        const cacheTimestamp = localStorage.getItem('portfolioDataTimestamp');
        
        // Cache is valid for 1 hour (3600000 ms)
        const CACHE_DURATION = 3600000;
        const now = new Date().getTime();
        
        // Return cached data if it exists and is not expired
        if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < CACHE_DURATION)) {
            return JSON.parse(cachedData);
        }
        
        // Show loader while fetching
        showLoader();
        
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Network response error: ${response.status}`);
            }
            const data = await response.json();
            
            // Cache the data and timestamp
            localStorage.setItem('portfolioData', JSON.stringify(data));
            localStorage.setItem('portfolioDataTimestamp', now.toString());
            
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            
            // If there's cached data, use it as fallback even if expired
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            
            return null;
        } finally {
            hideLoader();
        }
    }

    // Populate page with fetched data
    async function populatePage() {
        const data = await fetchData();
        if (!data) {
            console.error('Failed to load data');
            
            // Show error message if no data is available
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-container';
            errorMessage.innerHTML = `
                <p>Failed to load data. Please check your connection and try again.</p>
                <button class="retry-button" id="retry-button">RETRY</button>
            `;
            
            if (main) {
                main.innerHTML = '';
                main.appendChild(errorMessage);
                
                // Add retry button event listener
                document.getElementById('retry-button').addEventListener('click', () => {
                    localStorage.removeItem('portfolioData');
                    localStorage.removeItem('portfolioDataTimestamp');
                    location.reload();
                });
            }
            
            return;
        }

        // Update experience section if it exists
        if (data.experience && data.experience.length > 0) {
            updateExperienceSection(data.experience);
        }

        // Update projects section if it exists
        if (data.projects && data.projects.length > 0) {
            updateProjectsSection(data.projects);
        }

        // Update talks section if it exists
        if (data.talks && data.talks.length > 0) {
            updateTalksSection(data.talks);
        }

        // Update about section if it exists
        if (data.about && data.about.length > 0) {
            updateAboutSection(data.about);
        }

        // Update skills section if it exists
        if (data.skills && data.skills.length > 0) {
            updateSkillsSection(data.skills);
        }

        // Update education section if it exists
        if (data.education && data.education.length > 0) {
            updateEducationSection(data.education);
        }

        // Update social links from about section
        updateSocialLinks(data.about);
        
        // Apply interactive features after content is loaded
        initializeInteractiveFeatures();
    }

    // Update experience section
    function updateExperienceSection(experiences) {
        // Find experience containers
        const dashboardExperienceContainer = document.querySelector('.recent-experience-section .cards-container');
        const experienceTimelineContainer = document.querySelector('.timeline');

        // Sort experiences by start date (newest first)
        experiences.sort((a, b) => {
            return new Date(b.start_date) - new Date(a.start_date);
        });

        // Update dashboard experience (last 3)
        if (dashboardExperienceContainer) {
            dashboardExperienceContainer.innerHTML = '';
            const recentExperiences = experiences.slice(0, 3);
            
            recentExperiences.forEach(exp => {
                const endDate = exp.end_date === 'Present' ? 'Present' : new Date(exp.end_date).getFullYear();
                const startDate = new Date(exp.start_date).getFullYear();
                
                dashboardExperienceContainer.innerHTML += `
                    <div class="experience-card">
                        <div class="card-header">
                            <h3>${exp.role}</h3>
                            <span class="date">${startDate} - ${endDate}</span>
                        </div>
                        <h4 class="company">${exp.company}</h4>
                        <p class="description">${exp.description || 'Working on cutting-edge technology solutions and innovations.'}</p>
                        <div class="tech-tags">
                            ${createTagsHTML(exp.tags)}
                        </div>
                    </div>
                `;
            });
        }

        // Update experience timeline page
        if (experienceTimelineContainer) {
            experienceTimelineContainer.innerHTML = '';
            
            experiences.forEach(exp => {
                const endDate = exp.end_date === 'Present' ? 'Present' : formatDate(exp.end_date);
                const startDate = formatDate(exp.start_date);
                
                experienceTimelineContainer.innerHTML += `
                    <div class="timeline-item">
                        <div class="timeline-dot">
                            <i class="fas fa-briefcase"></i>
                        </div>
                        <div class="timeline-date">
                            <span>${startDate} - ${endDate}</span>
                        </div>
                        <div class="timeline-content">
                            <div class="experience-card detailed">
                                <div class="card-header">
                                    <h3>${exp.role}</h3>
                                    <div class="company-logo">
                                        <i class="fas fa-building"></i>
                                    </div>
                                </div>
                                <h4 class="company">${exp.company}</h4>
                                <p class="location"><i class="fas fa-map-marker-alt"></i> ${exp.location || 'Remote'}</p>
                                <div class="responsibilities">
                                    ${exp.description ? `<p class="description">${exp.description}</p>` : ''}
                                    ${exp.key_acheivements ? `
                                        <h5>Key Achievements:</h5>
                                        <ul>
                                            ${formatBulletPoints(exp.key_acheivements)}
                                        </ul>
                                    ` : ''}
                                </div>
                                <div class="tech-tags">
                                    ${createTagsHTML(exp.tags)}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        // Update experience count in stats section
        const experienceStats = document.querySelector('.stats-section .stats-card:nth-child(1) .stats-content .stats-number');
        if (experienceStats) {
            const yearsOfExperience = calculateExperienceYears(experiences);
            experienceStats.textContent = `${yearsOfExperience}+`;
        }
    }

    // Update projects section
    function updateProjectsSection(projects) {
        // Find project containers
        const dashboardProjectsContainer = document.querySelector('.recent-projects-section .cards-container');
        const projectsGridContainer = document.querySelector('.projects-grid');

        // Sort projects by date (newest first)
        projects.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        // Update dashboard projects (last 3)
        if (dashboardProjectsContainer) {
            dashboardProjectsContainer.innerHTML = '';
            const recentProjects = projects.slice(0, 3);
            
            recentProjects.forEach(project => {
                const iconClass = getProjectIcon(project.domain || project.tags);
                
                dashboardProjectsContainer.innerHTML += `
                    <div class="project-card">
                        <div class="project-image">
                            <i class="fas ${iconClass}"></i>
                        </div>
                        <div class="project-content">
                            <h3>${project.title}</h3>
                            <p>${project.description}</p>
                            <div class="tech-tags">
                                ${createTagsHTML(project.tags)}
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        // Update projects grid on projects page
        if (projectsGridContainer) {
            projectsGridContainer.innerHTML = '';
            
            projects.forEach(project => {
                const iconClass = getProjectIcon(project.domain || project.tags);
                const year = project.date ? new Date(project.date).getFullYear() : '';
                const domain = project.domain || getProjectDomain(project.tags);
                
                projectsGridContainer.innerHTML += `
                    <div class="project-item" data-category="${getCategoryFromTags(project.tags)}">
                        <div class="project-card large">
                            <div class="project-header">
                                <div class="project-icon">
                                    <i class="fas ${iconClass}"></i>
                                </div>
                                <div class="project-meta">
                                    ${year ? `<span class="project-year">${year}</span>` : ''}
                                    <span class="project-type">${domain}</span>
                                </div>
                            </div>
                            <div class="project-content">
                                <h3>${project.title}</h3>
                                <p class="project-description">${project.description}</p>
                                ${project.key_features ? `
                                    <div class="project-details">
                                        <div class="project-goals">
                                            <h4>Key Features:</h4>
                                            <ul>
                                                ${formatBulletPoints(project.key_features)}
                                            </ul>
                                        </div>
                                        <div class="tech-tags">
                                            ${createTagsHTML(project.tags)}
                                        </div>
                                    </div>
                                ` : `
                                    <div class="tech-tags">
                                        ${createTagsHTML(project.tags)}
                                    </div>
                                `}
                                ${project.github ? `
                                    <div class="project-links">
                                        <a href="${project.github}" class="project-link" target="_blank"><i class="fab fa-github"></i> GitHub</a>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        // Update project count in stats section
        const projectsStats = document.querySelector('.stats-section .stats-card:nth-child(2) .stats-content .stats-number');
        if (projectsStats) {
            projectsStats.textContent = `${projects.length}+`;
        }
    }
    function updateTalksSection(talksData) {
        console.log("Original talks data:", talksData);
        
        // Convert single talk object to array if needed
        let talks = talksData;
        if (!Array.isArray(talksData) && typeof talksData === 'object') {
            talks = [talksData]; // Convert single object to array with one item
            console.log("Converted single talk to array:", talks);
        }
        
        // If talks is still not an array or is empty, create empty array
        if (!Array.isArray(talks) || talks.length === 0) {
            console.log("No valid talks data found, using empty array");
            talks = [];
        }
            
        // Find talks containers
        const dashboardTalksContainer = document.querySelector('.recent-talks-section .cards-container');
        const talksListSection = document.querySelector('.talks-list-section');
        const featuredTalkContainer = document.querySelector('.featured-talk-content');
        const upcomingTalksContainer = document.querySelector('.upcoming-talks');
        
        // Get current date for upcoming talks detection
        const currentDate = new Date();
        
        // Process tags for each talk (convert string to array if necessary)
        talks.forEach(talk => {
            // Ensure tags exist and handle different formats
            if (!talk.tags) {
                talk.tags = [];
            } else if (typeof talk.tags === 'string') {
                // Only try to split if it's a non-empty string
                if (talk.tags.trim()) {
                    talk.tags = talk.tags.split(',').map(tag => tag.trim());
                } else {
                    talk.tags = [];
                }
            } else if (!Array.isArray(talk.tags)) {
                // If it's neither a string nor an array, default to empty array
                talk.tags = [];
            }
        });
        
        // Sort talks by date (newest first)
        talks.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
    
        // Separate past and upcoming talks
        const upcomingTalks = talks.filter(talk => new Date(talk.date) > currentDate);
        const pastTalks = talks.filter(talk => new Date(talk.date) <= currentDate);
        
        // Find featured talk
        const featuredTalk = pastTalks.find(talk => talk.featured === true) || (pastTalks.length > 0 ? pastTalks[0] : null);
    
        // Update dashboard talks (last 3)
        if (dashboardTalksContainer) {
            dashboardTalksContainer.innerHTML = '';
            const recentTalks = pastTalks.slice(0, 3);
            
            recentTalks.forEach(talk => {
                const talkDate = new Date(talk.date);
                const month = talkDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                const year = talkDate.getFullYear();
                
                dashboardTalksContainer.innerHTML += `
                    <div class="talk-card">
                        <div class="talk-date">
                            <span class="month">${month}</span>
                            <span class="year">${year}</span>
                        </div>
                        <div class="talk-content">
                            <h3>${talk.title}</h3>
                            <p class="event">${talk.location}</p>
                            <p class="description">${talk.description}</p>
                        </div>
                    </div>
                `;
            });
        }
    
        // Update featured talk on talks page
        if (featuredTalkContainer && featuredTalk) {
            const talkDate = new Date(featuredTalk.date);
            const month = talkDate.toLocaleString('default', { month: 'short' }).toUpperCase();
            const day = talkDate.getDate();
            const year = talkDate.getFullYear();
            
            featuredTalkContainer.innerHTML = `
                <div class="talk-meta">
                    <div class="talk-date">
                        <span class="month">${month}</span>
                        <span class="day">${day}</span>
                        <span class="year">${year}</span>
                    </div>
                    <div class="talk-info">
                        <h2>${featuredTalk.title}</h2>
                        <p class="event"><i class="fas fa-map-marker-alt"></i> ${featuredTalk.location}</p>
                        <p class="description">${featuredTalk.description}</p>
                        <div class="talk-tags">
                            ${createTagsHTML_talks(featuredTalk.tags)}
                        </div>
                    </div>
                </div>
                ${featuredTalk.slides ? `
                    <div class="talk-resources">
                        <a href="${featuredTalk.slides}" class="resource-link" target="_blank"><i class="fas fa-file-powerpoint"></i> Slides</a>
                    </div>
                ` : ''}
                ${featuredTalk.recording ? `
                    <div class="talk-resources">
                        <a href="${featuredTalk.recording}" class="resource-link" target="_blank"><i class="fas fa-video"></i> Recording</a>
                    </div>
                ` : ''}
            `;
        }
    
        // Update upcoming talks section
        if (upcomingTalksContainer) {
            // Keep the heading but clear the rest
            const upcomingTalksHeading = upcomingTalksContainer.querySelector('.section-title');
            upcomingTalksContainer.innerHTML = '';
            if (upcomingTalksHeading) {
                upcomingTalksContainer.appendChild(upcomingTalksHeading);
            } else {
                const newHeading = document.createElement('h2');
                newHeading.className = 'section-title';
                newHeading.textContent = 'Upcoming Talks';
                upcomingTalksContainer.appendChild(newHeading);
            }
            
            if (upcomingTalks.length > 0) {
                // Sort upcoming talks by date (earliest first)
                upcomingTalks.sort((a, b) => new Date(a.date) - new Date(b.date));
                
                // Add each upcoming talk
                upcomingTalks.forEach(talk => {
                    const talkDate = new Date(talk.date);
                    const month = talkDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                    const day = talkDate.getDate();
                    const year = talkDate.getFullYear();
                    
                    const upcomingTalkCard = document.createElement('div');
                    upcomingTalkCard.className = 'upcoming-talk-card';
                    upcomingTalkCard.innerHTML = `
                        <div class="upcoming-badge">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Upcoming</span>
                        </div>
                        <div class="talk-date">
                            <span class="month">${month}</span>
                            <span class="day">${day}</span>
                            <span class="year">${year}</span>
                        </div>
                        <div class="talk-content">
                            <h3>${talk.title}</h3>
                            <p class="event"><i class="fas fa-map-marker-alt"></i> ${talk.location}</p>
                            <p class="description">${talk.description}</p>
                        </div>
                    `;
                    
                    upcomingTalksContainer.appendChild(upcomingTalkCard);
                });
            } else {
                // If no upcoming talks, add a message
                const noUpcomingMessage = document.createElement('p');
                noUpcomingMessage.className = 'no-upcoming-message';
                noUpcomingMessage.textContent = 'No upcoming talks scheduled at the moment. Check back soon!';
                upcomingTalksContainer.appendChild(noUpcomingMessage);
            }
        }
    
        // Update talks list on talks page - grouped by year
        if (talksListSection) {
            // Keep the section title
            const sectionTitle = talksListSection.querySelector('.section-title');
            talksListSection.innerHTML = '';
            talksListSection.appendChild(sectionTitle);
            
            if (pastTalks.length === 0) {
                // If no talks, show a message
                const noTalksMessage = document.createElement('p');
                noTalksMessage.className = 'no-talks-message';
                noTalksMessage.textContent = 'No presentations available at the moment.';
                talksListSection.appendChild(noTalksMessage);
                return;
            }
            
            // Group talks by year
            const talksByYear = {};
            pastTalks.forEach(talk => {
                // Ensure we have a valid date object
                const talkDate = new Date(talk.date);
                if (!isNaN(talkDate.getTime())) {
                    const year = talkDate.getFullYear();
                    if (!talksByYear[year]) {
                        talksByYear[year] = [];
                    }
                    talksByYear[year].push(talk);
                } else {
                    console.error('Invalid date format:', talk.date, 'for talk:', talk.title);
                }
            });
            
            console.log("Talks grouped by year:", talksByYear);
            
            // Create year sections in descending order
            const years = Object.keys(talksByYear).sort((a, b) => b - a);
            console.log("Years found:", years);
            
            if (years.length === 0) {
                // If no valid years, show a message
                const noYearsMessage = document.createElement('p');
                noYearsMessage.className = 'no-talks-message';
                noYearsMessage.textContent = 'No presentations with valid dates available.';
                talksListSection.appendChild(noYearsMessage);
                return;
            }
            
            // Create year tabs using pagination buttons (reusing existing CSS)
            const pagination = document.createElement('div');
            pagination.className = 'pagination';
            
            years.forEach((year, index) => {
                const yearBtn = document.createElement('button');
                yearBtn.className = 'pagination-btn' + (index === 0 ? ' active' : '');
                yearBtn.textContent = year;
                yearBtn.setAttribute('data-year', year);
                
                // Add click handler for year buttons
                yearBtn.addEventListener('click', function() {
                    // Update active state
                    document.querySelectorAll('.pagination-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    // Show/hide appropriate year sections
                    document.querySelectorAll('.year-section').forEach(section => {
                        const sectionYear = section.getAttribute('data-year');
                        section.style.display = sectionYear === yearBtn.getAttribute('data-year') ? 'block' : 'none';
                    });
                });
                
                pagination.appendChild(yearBtn);
            });
            
            talksListSection.appendChild(pagination);
            
            // Create all year sections but only show the first one initially
            years.forEach((year, index) => {
                // Create year section
                const yearSection = document.createElement('div');
                yearSection.className = 'year-section';
                yearSection.setAttribute('data-year', year);
                yearSection.style.display = index === 0 ? 'block' : 'none';
                
                // Create talks grid for this year
                const yearGrid = document.createElement('div');
                yearGrid.className = 'talks-grid';
                
                // Add talks for this year
                talksByYear[year].forEach(talk => {
                    // Skip the featured talk in the grid
                    if (featuredTalk && talk.title === featuredTalk.title && 
                        talk.date === featuredTalk.date) {
                        return;
                    }
                    
                    const talkDate = new Date(talk.date);
                    const month = talkDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                    const day = talkDate.getDate();
                    
                    const talkItem = document.createElement('div');
                    talkItem.className = 'talk-item';
                    talkItem.innerHTML = `
                        <div class="talk-card">
                            <div class="talk-date">
                                <span class="month">${month}</span>
                                <span class="day">${day}</span>
                                <span class="year">${year}</span>
                            </div>
                            <div class="talk-content">
                                <h3>${talk.title}</h3>
                                <p class="event"><i class="fas fa-map-marker-alt"></i> ${talk.location}</p>
                                <p class="description">${talk.description}</p>
                                <div class="talk-tags">
                                    ${createTagsHTML_talks(talk.tags)}
                                </div>
                                ${talk.slides ? `
                                    <div class="talk-resources">
                                        <a href="${talk.slides}" class="resource-link" target="_blank">
                                            <i class="fas fa-file-powerpoint"></i> Slides
                                        </a>
                                    </div>
                                ` : ''}
                                ${talk.recording ? `
                                    <div class="talk-resources">
                                        <a href="${talk.recording}" class="resource-link" target="_blank">
                                            <i class="fas fa-video"></i> Recording
                                        </a>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                    
                    yearGrid.appendChild(talkItem);
                });
                
                yearSection.appendChild(yearGrid);
                talksListSection.appendChild(yearSection);
            });
        }
    
        // Update talks count in stats section
        const talksStats = document.querySelector('.stats-section .stats-card:nth-child(3) .stats-content .stats-number');
        if (talksStats) {
            talksStats.textContent = `${talks.length}+`;
        }
    }


    // Update about section
    function updateAboutSection(aboutItems) {
        // Find bio section
        const bioSection = document.querySelector('.about-section p');
        
        // Update bio if it exists
        const bio = aboutItems.find(item => item.section === 'bio');
        if (bioSection && bio) {
            bioSection.innerHTML = bio.value;
        }

        // Find email in contact page
        const emailContact = document.querySelector('.contact-detail a[href^="mailto:"]');
        const email = aboutItems.find(item => item.section === 'email');
        if (emailContact && email) {
            emailContact.href = `mailto:${email.value}`;
            emailContact.textContent = email.value;
        }

        // Update resume download link
        const resumeLinks = document.querySelectorAll('.download-btn');
        const resume = aboutItems.find(item => item.section === 'resume');
        if (resumeLinks.length > 0 && resume) {
            resumeLinks.forEach(link => {
                link.href = resume.value;
            });
        }
    }

    // Update skills section
    function updateSkillsSection(skills) {
        // Group skills by section
        const skillsBySection = {};
        skills.forEach(skill => {
            if (!skillsBySection[skill.section]) {
                skillsBySection[skill.section] = [];
            }
            skillsBySection[skill.section].push(skill);
        });

        // Find skills container
        const skillsContainer = document.querySelector('.skills-container');
        
        if (skillsContainer) {
            skillsContainer.innerHTML = '';
            
            // Add each skill category
            Object.keys(skillsBySection).forEach(section => {
                const categorySkills = skillsBySection[section];
                
                const skillCategory = document.createElement('div');
                skillCategory.className = 'skill-category';
                
                skillCategory.innerHTML = `
                    <h4>${section}</h4>
                    <div class="skill-group">
                        ${categorySkills.map(skill => `
                            <div class="skill-item">
                                <span class="skill-name">${skill.skills}</span>
                                <div class="skill-bar">
                                    <div class="skill-level" style="width: ${skill.expertise * 20}%;"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                
                skillsContainer.appendChild(skillCategory);
            });
            
            // Animate skills after they're added
            setTimeout(() => {
                animateSkills();
            }, 500);
        }

        // Update skills in index page
        const skillsSection = document.querySelector('.skills');
        if (skillsSection) {
            skillsSection.innerHTML = '';
            
            // Get top skills (highest expertise) from each category
            const topSkills = [];
            Object.keys(skillsBySection).forEach(section => {
                const categorySkills = skillsBySection[section];
                categorySkills.sort((a, b) => b.expertise - a.expertise);
                topSkills.push(...categorySkills.slice(0, 2));
            });
            
            // Add top skills to skills section
            topSkills.forEach(skill => {
                const skillElement = document.createElement('div');
                skillElement.className = 'skill';
                skillElement.textContent = skill.skills;
                skillsSection.appendChild(skillElement);
            });
        }
    }

    // Update education section
    function updateEducationSection(education) {
        // Find education container
        const educationContainer = document.querySelector('.education-items');
        
        if (educationContainer) {
            educationContainer.innerHTML = '';
            
            education.forEach(edu => {
                const startYear = new Date(edu.start).getFullYear();
                const endYear = edu.end === 'Present' ? 'Present' : new Date(edu.end).getFullYear();
                
                educationContainer.innerHTML += `
                    <div class="education-item">
                        <div class="ed-year">${startYear} - ${endYear}</div>
                        <div class="ed-info">
                            <h4>${edu.degree} in ${edu.specialization}</h4>
                            <p>${edu.organisation}</p>
                        </div>
                    </div>
                `;
            });
        }
    }

    // Update social links
    function updateSocialLinks(aboutItems) {
        if (!aboutItems) return;

        // Find social links containers
        const socialLinksContainers = document.querySelectorAll('.social-links');
        
        // Map of section names to Font Awesome classes
        const iconMap = {
            'linkedin': 'fab fa-linkedin',
            'github': 'fab fa-github',
            'twitter': 'fab fa-twitter',
            'medium': 'fab fa-medium',
            'blogs': 'fas fa-rss',
            'website': 'fas fa-globe'
        };
        
        // Social links available in the about data
        const socialLinks = [];
        
        // Check for each social platform
        Object.keys(iconMap).forEach(platform => {
            const item = aboutItems.find(item => item.section === platform);
            if (item) {
                socialLinks.push({
                    platform: platform,
                    url: item.value,
                    icon: iconMap[platform]
                });
            }
        });
        
        // Update all social links containers
        socialLinksContainers.forEach(container => {
            // Clear existing links
            container.innerHTML = '';
            
            // Add each social link
            socialLinks.forEach(link => {
                // Create link element
                const linkElement = document.createElement('a');
                linkElement.href = link.url;
                linkElement.className = 'social-link';
                linkElement.target = '_blank';
                
                // Different HTML structure based on container class
                if (container.closest('.social-connect')) {
                    linkElement.innerHTML = `
                        <i class="${link.icon}"></i>
                        <span>${capitalizeFirstLetter(link.platform)}</span>
                    `;
                } else {
                    linkElement.innerHTML = `<i class="${link.icon}"></i>`;
                }
                
                container.appendChild(linkElement);
            });
        });
    }

    // Initialize all interactive features
    function initializeInteractiveFeatures() {
        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
        
        // Project filtering
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectItems = document.querySelectorAll('.project-item');
        
        if (filterBtns.length && projectItems.length) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active class from all buttons
                    filterBtns.forEach(b => b.classList.remove('active'));
                    
                    // Add active class to clicked button
                    btn.classList.add('active');
                    
                    // Get filter value
                    const filter = btn.getAttribute('data-filter');
                    
                    // Filter projects
                    projectItems.forEach(item => {
                        if (filter === 'all') {
                            item.style.display = 'block';
                        } else {
                            const categories = item.getAttribute('data-category').split(' ');
                            if (categories.includes(filter)) {
                                item.style.display = 'block';
                            } else {
                                item.style.display = 'none';
                            }
                        }
                    });
                });
            });
        }
        
        // FAQ accordion
        const faqItems = document.querySelectorAll('.faq-item');
        
        if (faqItems.length) {
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                
                question.addEventListener('click', () => {
                    // Close other FAQs
                    faqItems.forEach(i => {
                        if (i !== item) {
                            i.classList.remove('active');
                        }
                    });
                    
                    // Toggle current FAQ
                    item.classList.toggle('active');
                });
            });
        }
        
        // Form submission handling
        const contactForm = document.getElementById('contactForm');
        const formResponse = document.getElementById('formResponse');
        
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
              e.preventDefault();
          
              fetch("https://checkip.amazonaws.com/")
                .then(res => res.text())
                .then(ip => {
                  processFormSubmission(ip.trim());
                })
                .catch(error => {
                  console.error("Error fetching IP:", error);
                  processFormSubmission("unknown");
                });
          
              function processFormSubmission(ip) {
                const formData = new FormData(contactForm);
                const jsonData = {};
          
                formData.forEach((value, key) => {
                  jsonData[key] = value;
                });
          
                jsonData.ip = ip;
          
                fetch(API_URL, {
                  method: "POST",
                  mode: "no-cors",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(jsonData)
                });
          
                // Simulate form submission
                formResponse.textContent = 'Looks like some issue is there! Please contact me over email : hey@lakshaykumar.tech';
                formResponse.classList.remove('error');
                formResponse.classList.add('error');
                formResponse.style.display = 'block';
          
                contactForm.reset();
              }
            });
          }
          
        
        // Add hover effects to cards
        const experienceCards = document.querySelectorAll('.experience-card');
        const projectCards = document.querySelectorAll('.project-card');
        const talkCards = document.querySelectorAll('.talk-card');
        
        const addHoverEffects = (cards) => {
            cards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-5px)';
                    card.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
                    card.style.borderColor = 'var(--text-primary)';
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = '';
                    card.style.boxShadow = '';
                    card.style.borderColor = '';
                });
            });
        };
        
        addHoverEffects(experienceCards);
        addHoverEffects(projectCards);
        addHoverEffects(talkCards);
        
        // Pagination functionality
        const paginationBtns = document.querySelectorAll('.pagination-btn');
        
        if (paginationBtns.length) {
            paginationBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    paginationBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // In a real implementation, this would load new content
                    // This is just for demonstration purposes
                    if (!btn.classList.contains('next')) {
                        // Show some kind of loading indicator
                        const talksGrid = document.querySelector('.talks-grid');
                        if (talksGrid) {
                            talksGrid.style.opacity = '0.5';
                            setTimeout(() => {
                                talksGrid.style.opacity = '1';
                            }, 500);
                        }
                    }
                });
            });
        }
        
        // Add typewriter effect to the main title on the homepage
        const mainTitle = document.querySelector('.dashboard .name');
        
        if (mainTitle) {
            const text = mainTitle.textContent;
            mainTitle.textContent = '';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    mainTitle.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                }
            };
            
            // Start the typewriter effect
            typeWriter();
        }
        
        // Add active class to current navigation item based on URL
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.nav-links a');
        
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (currentPath.endsWith(href)) {
                item.classList.add('active');
            } else if (currentPath === '/' && href === 'index.html') {
                item.classList.add('active');
            }
        });
    }

    // Animate skills on scroll
    function animateSkills() {
        const skillLevels = document.querySelectorAll('.skill-level');
        
        skillLevels.forEach(level => {
            const width = level.style.width;
            level.style.width = '0';
            
            setTimeout(() => {
                level.style.transition = 'width 1s ease-in-out';
                level.style.width = width;
            }, 300);
        });
    }

    // Clear cache button (for development purposes)
    function addClearCacheButton() {
        const footer = document.querySelector('.main-footer .container');
        
        if (footer) {
            const clearCacheButton = document.createElement('button');
            clearCacheButton.textContent = 'Clear Data Cache';
            clearCacheButton.className = 'clear-cache-btn';
            clearCacheButton.style.cssText = `
                background: rgba(255, 59, 48, 0.1);
                color: var(--error);
                border: 1px solid var(--error);
                padding: 0.5rem 1rem;
                margin-top: 1rem;
                cursor: pointer;
                font-size: 0.8rem;
                display: none;
            `;
            
            clearCacheButton.addEventListener('click', () => {
                localStorage.removeItem('portfolioData');
                localStorage.removeItem('portfolioDataTimestamp');
                location.reload();
            });
            
            footer.appendChild(clearCacheButton);
            
            // Show button on triple-click on footer
            let clickCount = 0;
            footer.addEventListener('click', () => {
                clickCount++;
                if (clickCount === 3) {
                    clearCacheButton.style.display = 'block';
                    clickCount = 0;
                    setTimeout(() => {
                        clearCacheButton.style.display = 'none';
                    }, 5000);
                }
            });
        }
    }

    function createTagsHTML_talks(tags) {
        if (!tags || !Array.isArray(tags) || tags.length === 0) return '';
        
        return tags.map(tag => `<span>${tag}</span>`).join('');
    }

    // Helper function to create tags HTML
    function createTagsHTML(tagsString) {
        if (!tagsString) return '';
        
        const tags = tagsString.split(',').map(tag => tag.trim());
        return tags.map(tag => `<span>${tag}</span>`).join('');
    }

    // Helper function to format bullet points
    function formatBulletPoints(text) {
        if (!text) return '';
        
        // Split by newlines or bullet points
        const points = text.split(/\n|-/).filter(point => point.trim() !== '');
        return points.map(point => `<li>${point.trim()}</li>`).join('');
    }

    // Helper function to format date
    function formatDate(dateString) {
        if (dateString === 'Present') return 'Present';
        
        const date = new Date(dateString);
        return date.getFullYear();
    }

    // Helper function to calculate total years of experience
    function calculateExperienceYears(experiences) {
        if (!experiences || experiences.length === 0) return 0;
        
        // Find earliest start date and latest end date
        let earliestStart = new Date();
        let latestEnd = new Date(0); // January 1, 1970
        
        experiences.forEach(exp => {
            const startDate = new Date(exp.start_date);
            if (startDate < earliestStart) {
                earliestStart = startDate;
            }
            
            const endDate = exp.end_date === 'Present' ? new Date() : new Date(exp.end_date);
            if (endDate > latestEnd) {
                latestEnd = endDate;
            }
        });
        
        // Calculate difference in years
        const yearsOfExperience = Math.floor((latestEnd - earliestStart) / (1000 * 60 * 60 * 24 * 365));
        return yearsOfExperience;
    }

    // Helper function to get appropriate icon for project
    function getProjectIcon(domainOrTags) {
        const domainMap = {
            'Machine Learning': 'fa-brain',
            'ML': 'fa-brain',
            'Data Science': 'fa-chart-bar',
            'Web Development': 'fa-code',
            'Mobile App': 'fa-mobile-alt',
            'API': 'fa-cloud',
            'Generative AI': 'fa-robot',
            'GenAI': 'fa-robot',
            'NLP': 'fa-language',
            'Computer Vision': 'fa-eye',
            'DevOps': 'fa-server',
            'Blockchain': 'fa-link',
            'IoT': 'fa-microchip'
        };
        
        // Check if domain is provided
        if (typeof domainOrTags === 'string') {
            // Try to match domain or tags with known categories
            for (const [domain, icon] of Object.entries(domainMap)) {
                if (domainOrTags.includes(domain)) {
                    return icon;
                }
            }
        }
        
        // Default icon
        return 'fa-project-diagram';
    }

    // Helper function to get project domain from tags
    function getProjectDomain(tags) {
        if (!tags) return 'Project';
        
        const knownDomains = [
            'Machine Learning', 'Data Science', 'Web Development', 
            'Mobile App', 'API', 'Generative AI', 'NLP', 
            'Computer Vision', 'DevOps', 'Blockchain', 'IoT'
        ];
        
        // Convert tags to array
        const tagsList = tags.split(',').map(tag => tag.trim());
        
        // Try to find a matching domain
        for (const domain of knownDomains) {
            if (tagsList.some(tag => tag.toLowerCase().includes(domain.toLowerCase()))) {
                return domain;
            }
        }
        
        // Return first tag as fallback
        return tagsList[0] || 'Project';
    }

    // Helper function to get category from tags for filtering
    function getCategoryFromTags(tags) {
        if (!tags) return 'other';
        
        const tagsList = tags.toLowerCase().split(',').map(tag => tag.trim());
        
        // Map tags to categories
        const categoryMap = {
            'genai': ['genai', 'generative ai', 'llm', 'gpt', 'ai', 'openai', 'claude', 'ollama'],
            'ml': ['ml', 'machine learning', 'neural', 'deep learning', 'tensorflow', 'pytorch', 'model'],
            'nlp': ['nlp', 'natural language', 'text', 'language', 'sentiment'],
            'data': ['data', 'analytics', 'visualization', 'statistics', 'dashboard', 'bi', 'analysis']
        };
        
        // Find matching categories
        const categories = [];
        
        Object.entries(categoryMap).forEach(([category, keywords]) => {
            if (tagsList.some(tag => keywords.some(keyword => tag.includes(keyword)))) {
                categories.push(category);
            }
        });
        
        return categories.length > 0 ? categories.join(' ') : 'other';
    }

    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Add the CSS for loader to the page
    function addLoaderStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .loader-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1000;
                background: rgba(0, 0, 0, 0.8);
                padding: 2rem;
                border: 1px solid var(--border);
                border-radius: 5px;
            }

            .loader {
                width: 50px;
                height: 50px;
                border: 3px solid var(--border);
                border-radius: 50%;
                border-top-color: var(--text-primary);
                animation: spin 1s ease-in-out infinite;
                margin-bottom: 1rem;
            }

            @keyframes spin {
                to {
                    transform: rotate(360deg);
                }
            }

            .loader-text {
                color: var(--text-secondary);
                font-size: 0.9rem;
                letter-spacing: 1px;
            }

            .error-container {
                background: rgba(255, 0, 0, 0.1);
                border: 1px solid rgba(255, 0, 0, 0.3);
                padding: 2rem;
                margin: 2rem;
                color: #ff6b6b;
                text-align: center;
            }

            .retry-button {
                background: var(--card-bg);
                color: var(--text-primary);
                border: 1px solid var(--border);
                padding: 0.75rem 1.5rem;
                margin-top: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .retry-button:hover {
                background: var(--hover-bg);
                border-color: var(--text-primary);
            }
        `;
        document.head.appendChild(style);
    }

    // Add loader styles
    addLoaderStyles();
    
    // Add clear cache button for development
    addClearCacheButton();

    // Call populatePage to fetch and display data
    populatePage();
});