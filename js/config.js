// ===================================
// CONFIGURATION
// ===================================

// Sign content data
export const signData = {
    'sign1': 'Press H to teleport back to your crash landing.',
    'sign2': 'These were the base for me to grow my creative interests...',
    'sign3': 'Walk left to know my story, right for (the start of) my professional journey.',
    'sign4': 'Other interests/hobbies.',
    'sign5': 'This way to see my hobbies/passions.',
    'sign6': 'Then, I started exploring the adirondacks.',
    'sign7': 'WASD to move. Space to jump. Hold Shift to sprint.',
    'sign8': 'I was born in Guangzhou, China, moving to the United States when I was 5.',
    'sign9': 'I had a great time growing up. Timeless memories were made with the friends I met.',
    'sign10': 'I took a leap of faith going to Colorado College, a small liberal arts school in Colorado Springs. I\'m grateful for all the things I\'ve been able to experience, and it\'s safe to say that these past 3 years have been incredibly transformative. I wouldn\'t be who I am today if not for the people I surrounded myself with and the passions I chose to pursue.',
    'sign11': 'The paths split up ahead.',
    'sign12': 'I\'m a student of Colorado College, majoring in Computer Science and minoring in Art Studio.',
    'sign13': 'Up ahead is a gallery of my professional works.',
    'sign17': 'Future projects: TBD',
    'sign15': 'I interned at Sports Media Inc. as a Software Engineer and Cyber Security Analyst. I discovered over 20 vulnerabilities in deployed and in-development applications, and collaborated with cross-functional teams to remediate them. These vulnerabilities included SQL Injection, exposed API credentials, authentication bypass, and more.',
    'sign16': 'I\'m currently researching the change of mental health stigma over time through scientific literature under Dr. Estelle Smith of the computer science department at Colorado School of Mines. This work prepares me for future research projects involving the application of my knowledge into HCI (human computer interaction), hopefully benefitting the world of spiritual care. Additionally, I am volunteering at Abode Hospice Care to get an even better understanding of the current state of spiritual care and how technology can be integrated into it.',
    'sign14': 'I also explored some penetration testing certifications, earning the eLearnSecurity Junior Penetration Tester (eJPT) certification in August 2025. I am now working towards the PNPT certification.',
    'sign18': 'Updates coming soon!',
    'sign19': 'Professional works this way.',
    'sign20': 'Personal life this way.',
    'sign21': 'Passions this way.',
    'sign22': 'Click the sign to see my videography portfolio.',
    'sign23': 'Thank You for Visiting!',
    'sign24': 'Esc for pause menu. ',
    'sign25': 'F to toggle bird\'s eye view. Left click & drag to rotate. Scroll wheel to zoom.',
    'sign26': 'X to reset entirely if you\'re in a pickle.',
    'signhome': 'Press H to teleport back to your crash landing.',
    'signp1': 'I basically grew up outside. And in front of a playstation.',
    'signp2': 'The adirondacks became familiar territory during covid, so why not take a step further and move to the rockies?',
    'signp3': 'And here we are. These passions up ahead were all thanks to the people at Colorado College, and the beautiful state of Colorado.',
    'signphotography': 'Check out my photography page!',
    //'signvideography': 'Press \'V\' to teleport to my videography world. It doesn\'t exist btw.',
    'signlinks': 'Links to my personal pages!', //https://www.instagram.com/max_mayy/ //https://www.linkedin.com/in/maximillian-may-734823268/ //https://github.com/mccarthurmay
    //'signrugby': 'Press \'R\' to open my rugby photos. I had too many concussions so I stopped playing games.',
};

// Planet constants
export const PLANET_RADIUS = 16;

// Camera constants
export const CAMERA_DISTANCE_IDLE = 1.2;
export const CAMERA_DISTANCE_WALKING = 1.7;
export const CAMERA_DISTANCE_SPRINTING = 2.5;
export const CAMERA_HEIGHT = 1.0;

// Camera sway constants
export const CAMERA_SWAY_INTENSITY = 0.003;
export const CAMERA_SWAY_SPEED = 25.0;
export const SWAY_SIDE_AMOUNT = 1;
export const SWAY_BOB_AMOUNT = 0.4;
export const SWAY_ROCK_AMOUNT = 0;

// Movement constants
export const MAX_MOVE_SPEED = 0.125;
export const MOVE_ACCELERATION = 0.8;
export const MOVE_DECELERATION = 1.5;
export const MOVE_SPEED = 0.2;
export const TURN_SPEED = 2;

// Sprint constants
export const SPRINT_MULTIPLIER = 2.0;
export const SPRINT_ACCELERATION_MULTIPLIER = 1.5;

// Physics constants
export const GRAVITY = 20.0;
export const JUMP_FORCE = 5.0;
export const CHARACTER_RADIUS = 0.1;
export const CHARACTER_HEIGHT = 0.075;
export const SPAWN_HEIGHT = 13;
export const FIXED_TIMESTEP = 1/60;

// Day/night cycle
export const DAY_NIGHT_SPEED = 0.025;

// Moon orbit - faster visible orbit
// Moon completes one orbit every ~3 day/night cycles for visibility
export const MOON_ORBIT_SPEED = DAY_NIGHT_SPEED / 3;

// Celestial bodies
// Sun is now realistically distant (like a real solar system)
// Smaller radius makes it appear more distant
export const SUN_DISTANCE = 1000;
export const SUN_RADIUS = 150; // Reduced from 300 to appear smaller and more distant
// Moon is very close to planet (just outside atmosphere)
export const MOON_DISTANCE = 30;
export const MOON_RADIUS = 3;

// Cloud constants
export const NUM_CLOUDS = 150;
export const CLOUD_BASE_DISTANCE = 16.2;
export const CLOUD_DISTANCE_VARIATION = 3;

// Bird's eye view
export const BIRD_EYE_DISTANCE_DEFAULT = 25;
export const BIRD_EYE_TILT = Math.PI / 6; // 30 degrees
export const BIRD_EYE_MIN_ZOOM = 8;
export const BIRD_EYE_MAX_ZOOM = 50;

// Sign proximity
export const SIGN_PROXIMITY_NORMAL = 3.0;
export const SIGN_PROXIMITY_BIRDS_EYE = 10.0;

// Intro animation
export const INTRO_CHASE_DURATION = 80 / 24; // 80 frames at 24fps = ~3.33 seconds
export const INTRO_EXPLOSION_DURATION = 2.0; // 2 seconds
export const INTRO_TRANSITION_DURATION = 1.5; // 1.5 seconds back to player
export const INTRO_CHASE_OFFSET_X = 0;
export const INTRO_CHASE_OFFSET_Y = 0.5; // Slightly above, not much
export const INTRO_CHASE_OFFSET_Z = -12; // Further behind spaceship for better view
export const INTRO_EXPLOSION_ZOOM_DISTANCE = 20;
