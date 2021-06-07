const puppeteer = require("puppeteer");

// small
// const handle = "dhurls87";
// large
// const handle = "justinbieber";
// medium
const handle = "dailystoic";

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: false, devtools: true });
  const page = await browser.newPage();

  // instagram will force you to login
  await page.goto("https://www.instagram.com/accounts/login/", {
    waitUntil: "networkidle2",
  });

  // use this debugger to login and authenticate yourself
  debugger;

  // visit page defined abo ver
  await page.goto(`https://www.instagram.com/${handle}`, {
    waitUntil: "networkidle2",
  });

  // find all posts on the page
  const links = await page.$$('a[href*="/p/"]');
  console.log(links);
  const post_like_count = [];

  for (var i = 0; i < links.length; i++) {
    const postUrl = await page.evaluate(
      (anchor) => anchor.getAttribute("href"),
      links[i]
    );
    // find post and hover over it to show likes
    const link_parent = (await links[i].$x(".."))[0];
    await link_parent.hover();
    await delay(1000);

    try {
      // only find posts with likes (excluded videos which count views)
      const heart = await link_parent.$("span.coreSpriteHeartSmall");
      if (heart) {
        const likes_parent = (await heart.$x(".."))[0];
        let likes = await likes_parent.$eval(
          "span:nth-child(1)",
          (el) => el.textContent
        );

        console.log(likes);

        // handle case of more than thousand likes
        if (likes.includes("k")) {
          console.log("over 1000 likes");
          likes = parseFloat(likes.replace("k", "")) * 1000;
          console.log(likes);
          post_like_count.push({
            likes: likes,
            postUrl: postUrl,
          });
          // handle case of more than million likes
        } else if (likes.includes("m")) {
          console.log("over million likes");
          likes = parseFloat(likes.replace("m", "")) * 1000000;
          console.log(likes);
          post_like_count.push({
            likes: likes,
            postUrl: postUrl,
          });
        } else {
          console.log("under 1000 likes");
          likes = parseInt(likes);
          console.log(likes);
          post_like_count.push({
            likes: likes,
            postUrl: postUrl,
          });
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  // array of posts with likes total and link to post
  console.log(post_like_count);

  await browser.close();
})();
