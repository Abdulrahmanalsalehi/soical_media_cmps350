import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });



// data is all AI generated
const usersData = [ 
  { fullname: "Alice Johnson",   username: "alice_j",   email: "alice@example.com",   phone: "+1-555-0101", gender: "Female", dob: new Date("1998-03-12"), bio: "Photography enthusiast & coffee lover " },
  { fullname: "Bob Martinez",    username: "bob_m",     email: "bob@example.com",     phone: "+1-555-0102", gender: "Male",   dob: new Date("1995-07-24"), bio: "Software dev by day, gamer by night " },
  { fullname: "Clara Smith",     username: "clara_s",   email: "clara@example.com",   phone: "+1-555-0103", gender: "Female", dob: new Date("2000-01-05"), bio: "Bookworm  | Traveler " },
  { fullname: "David Lee",       username: "david_l",   email: "david@example.com",   phone: "+1-555-0104", gender: "Male",   dob: new Date("1993-11-30"), bio: "Fitness coach & nutrition nerd " },
  { fullname: "Emma Wilson",     username: "emma_w",    email: "emma@example.com",    phone: "+1-555-0105", gender: "Female", dob: new Date("1999-06-18"), bio: "Artist & designer. Creating beauty daily " },
  { fullname: "Frank Brown",     username: "frank_b",   email: "frank@example.com",   phone: "+1-555-0106", gender: "Male",   dob: new Date("1990-09-07"), bio: "Chef who loves to experiment " },
  { fullname: "Grace Davis",     username: "grace_d",   email: "grace@example.com",   phone: "+1-555-0107", gender: "Female", dob: new Date("2001-02-14"), bio: "Music is my therapy " },
  { fullname: "Henry Clark",     username: "henry_c",   email: "henry@example.com",   phone: "+1-555-0108", gender: "Male",   dob: new Date("1997-08-22"), bio: "Entrepreneur & startup enthusiast " },
  { fullname: "Isabel Moore",    username: "isabel_m",  email: "isabel@example.com",  phone: "+1-555-0109", gender: "Female", dob: new Date("1996-04-03"), bio: "Nature lover  | Hiker | Camper" },
  { fullname: "Jake Taylor",     username: "jake_t",    email: "jake@example.com",    phone: "+1-555-0110", gender: "Male",   dob: new Date("2002-12-25"), bio: "Student | Future engineer " },
  { fullname: "Karen White",     username: "karen_w",   email: "karen@example.com",   phone: "+1-555-0111", gender: "Female", dob: new Date("1994-05-17"), bio: "Mom of 2 | Yoga instructor " },
  { fullname: "Liam Harris",     username: "liam_h",    email: "liam@example.com",    phone: "+1-555-0112", gender: "Male",   dob: new Date("1998-10-09"), bio: "Football fan  | Sports analytics" },
  { fullname: "Mia Thompson",    username: "mia_t",     email: "mia@example.com",     phone: "+1-555-0113", gender: "Female", dob: new Date("2000-07-31"), bio: "Aspiring journalist " },
  { fullname: "Noah Garcia",     username: "noah_g",    email: "noah@example.com",    phone: "+1-555-0114", gender: "Male",   dob: new Date("1992-03-28"), bio: "Film director & storyteller " },
  { fullname: "Olivia Martinez", username: "olivia_m",  email: "olivia@example.com",  phone: "+1-555-0115", gender: "Female", dob: new Date("1997-09-14"), bio: "Tech & science geek " },
];


const postsData = [
  { content: "Just finished my morning run! 5km in 25 minutes. Feeling amazing!  #fitness #running", daysAgo: 2 },
  { content: "Coffee and code. The perfect morning combo  Working on something exciting!", daysAgo: 3 },
  { content: "Visited the most beautiful café today. The atmosphere was just perfect for reading ", daysAgo: 5 },
  { content: "New recipe alert! Tried making homemade pasta from scratch and it turned out incredible ", daysAgo: 7 },
  { content: "Just discovered this amazing hiking trail. Nature never disappoints ", daysAgo: 10 },
  { content: "Finished reading 'Atomic Habits' for the third time. Every read reveals something new ", daysAgo: 12 },
  { content: "Excited to announce I just launched my first open-source project! Check it out ", daysAgo: 14 },
  { content: "Art is not what you see, but what you make others see. Today's sketch ", daysAgo: 15 },
  { content: "Grateful for the small things. A good book, warm coffee, and a cozy blanket ", daysAgo: 18 },
  { content: "Game night with friends! Nothing beats some healthy competition ", daysAgo: 20 },
  { content: "Meal prepped for the whole week! Consistency is key in fitness ", daysAgo: 22 },
  { content: "Watched the sunset from the hilltop today. Some moments are simply breathtaking ", daysAgo: 25 },
  { content: "Just hit 1000 followers! Thank you all for the support and love ", daysAgo: 28 },
  { content: "Working from home today. Productivity level: legendary ", daysAgo: 30 },
  { content: "Learning to play the guitar. Day 7. My fingers hurt but the progress is worth it ", daysAgo: 33 },
  { content: "Just tried aerial yoga for the first time. Challenging but so much fun! ", daysAgo: 35 },
  { content: "The city looks different at night. Took some photos on my evening walk ", daysAgo: 40 },
  { content: "Baked banana bread today. The whole house smells amazing ", daysAgo: 42 },
  { content: "Started a new painting series inspired by local landscapes ", daysAgo: 45 },
  { content: "First day at the new job! Nervous and excited at the same time ", daysAgo: 50 },
  { content: "Summer vacation planning! Where should I go next? ", daysAgo: 100 },
  { content: "Happy New Year everyone! Wishing you all an amazing year ahead ", daysAgo: 120 },
  { content: "Just graduated! Four years of hard work finally paid off ", daysAgo: 150 },
  { content: "Road trip across the country. Day 1 of 14! ", daysAgo: 180 },
  { content: "Adopted a rescue dog today. Meet Max! ", daysAgo: 200 },
];


const commentsData = [
  "This is awesome! Keep it up! ",
  "Love this so much ",
  "Wow, amazing work!",
  "So inspiring! Thanks for sharing",
  "I felt that in my soul ",
  "Goals! ",
  "You're killing it!",
  "This made my day better",
  "Wish I could do that!",
  "Absolutely beautiful ",
  "Congratulations! Well deserved!",
  "Can you share more details?",
  "This is exactly what I needed today",
  "Proud of you! Keep going ",
  "Your content never disappoints",
];

// function to calculate the date based on how many days ago it was posted
function daysAgoDate(days) {
    const day = new Date();
    // set the date = current date - how many days ago 
    day.setDate(day.getDate() - days);
    return day;
}

// function to get a random item from an array
function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}


// function to get a random subset of an array
function randomSubset(arr, min = 1, max = 5) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    return shuffled.slice(0, count);
}


// seeding database
async function main(){
    
    // delete eveything before seeding
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    // create users using data from usersData array
    const hashedPassword = await bcrypt.hash("Password123&", 10);
    const users = await Promise.all(
        usersData.map((u) => prisma.user.create({
            data: {
                ...u,
                password: hashedPassword,
            }
        }))
    )

    // create posts using data from postsData array
    const posts = await Promise.all(
        postsData.map((p, i) => prisma.post.create({
            data: {
                content: p.content,
                authorID: users[i % users.length].id,
                createdAt: daysAgoDate(p.daysAgo),
            }
        }))
    )

    // create follow relationships
    const followPairs = new Set(); // new set to avoid duplicate follows
    for (const follower of users) {
        // use randomSubset to get a random number of users to follow (between 1 and 10)
        const targets = randomSubset(users.filter((u) => u.id !== follower.id), 1, 10);
        for(const target of targets) {
            const key = `${follower.id}-${target.id}`;
            // if this follow relationship doesn't exist, create it
            if(!followPairs.has(key)) {
                followPairs.add(key);
                // create relationship in the database
                await prisma.follow.create({
                    data: {
                        followerID: follower.id,
                        followingID: target.id,
                    }
                })
            }
        }
    }

    const likePairs = new Set(); // new set to avoid duplicate likes
    for(const post of posts) {
        const likers = randomSubset(users, 1, 10);
        for(const liker of likers) {
            const key = `${liker.id}-${post.id}`;
                // if this like relationship doesn't exist, create it
            if(!likePairs.has(key)) {
                likePairs.add(key);
                // create relationship in the database
                await prisma.like.create({
                    data: {
                        userID: liker.id,
                        postID: post.id,
                    }
                })
            }
        }
    }
        
    let commentCount = 0;
    for(const post of posts){
        // get a random number of users to comment (between 1 and 5)
        const commenters = randomSubset(users, 1, 5);
        for(const commenter of commenters){
            // create comment 
            await prisma.comment.create({
                data: {
                    content: randomItem(commentsData),
                    userID: commenter.id,
                    postID: post.id,
                }
            })
            commentCount++;
        }
    }


}
// if seeding fails
main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {    
    await prisma.$disconnect();
});