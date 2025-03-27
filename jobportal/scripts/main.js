const api = async (config) => {
    const { endpoint, method = "GET" } = config || {};
    let url = "https://www.arbeitnow.com/api/job-board-api";
    try {
        const res = await fetch(url, {
            method,
        });
        if (res.status >= 200 && res.status < 300) {
            const data = await res.json();
            console.log(data)
            return data;
        }
        throw res;
    } catch (e) {
        console.log(e, url)
        throw new error("API FAILED", { cause: e });
    }
};

const getjobs = async () => {
    try {
        const data = await api();
        if (data && data.data && data.data.length) {
            let jobs = data.data;
            showJobs(jobs);
            handleLocationFilter(jobs);
            handleFavFilter(jobs);
            searchFilter(jobs); }
        else {
            //no jobs available
        }
    } catch (e) {
        //handle api errors

    }
};
function showJobs(jobs) {
    const jobsContainer = $("#jobs");

    const jobCards = jobs.map((item) =>
        createJobCard(item)
    )
    jobsContainer.append(...jobCards)
}

function createJobCard(jobItem) {
    const { title, company_name, location, remote, job_types, tags, created_at } = jobItem;
    var d = daysAgoFromTimestamp(created_at);
    let companyLogo = company_name.includes(".com")
        ? company_name
        : company_name + ".com";
    const jobCard = $(`<div class="job-card">
    <div class="job-logo">
        <img class="job-logo-img" src="https://img.logo.dev/${companyLogo}?token=pk_TLRk9T8ASV2UmMY8qXNNmQ"
            alt="${company_name}"
            onerror="loadDefaultImg()"
            />
    </div>
    <div class="job-content">
        <p class="job-title">
            <span class="job-company">${company_name} |</span>
            <span class="job-profile">${title}</span>
        </p>
        <p class="job-location">
            <i class="fa-solid fa-location-dot"></i>Job Available In ${location}

        </p>
        <p class="job-salary">
            80K-100K USD</p>
        <p class="job-des">Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste repellendus ullam
            odio nulla incidunt delectus earum, ea pariatur exercitationem nisi!</p>
        <p class="job-published">${d}</p>
        <div class="job-tags">
        ${job_types.map((i) => `<span class="job-tag">${i}</span>`).join("")}
        ${tags.map((i) => `<span class="job-tag">${i}</span>`).join("")}
           
            ${remote ? '<span class="job-tag">Remote</span>' : ""}
            
        </div>
    </div>
    <div class="job-actions">
        <button class="job-view-btn">View <i class="fa-solid fa-eye"></i></button>
        <div class="job-like-buttons">
            <button title="Not interested" class="job-unlike-btn"> <i
                    class="fa-solid fa-xmark"></i></button>
            <button title="Interested" class="job-like-btn"><i class="fa-solid fa-heart"></i></button>
        </div>
    </div>

</div>`);
    const imgE1 = jobCard.find(".job-logo-img");
    imgE1[0].onerror = loadDefaultImg;
    const unlikeBtn = jobCard.find(".job-unlike-btn");
    handleUnlike(unlikeBtn, jobCard, jobItem)
    const likeBtn = jobCard.find(".job-like-btn");
    handleLike(likeBtn,jobItem)
    return jobCard;


}
function loadDefaultImg() {
    this.src = "https://img.logo.dev/x.com?token=pk_TLRk9T8ASV2UmMY8qXNNmQ";
}
function daysAgoFromTimestamp(timestamp) {
    const createdDate = new Date(timestamp);
    const today = new Date();

    // Calculate difference in milliseconds
    const diffTime = today - createdDate;

    // Convert milliseconds to days
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 200)
        return `Posted More than 2 months`

    return `${diffDays} days ago`;
}
function handleUnlike(unlikeBtn, jobCard, jobItem) {
    unlikeBtn.on('click', function () {
        jobCard.remove();
        jobItem.isLike=false;
    });
}

function handleLike(likeBtn, jobItem) {
    likeBtn.on('click', function () {
        const countEl = $("#nav-fav");
        let currCount = parseInt(countEl.html()) || 0;
        let isAlreadyLiked = likeBtn.hasClass('job-liked-btn')
        if (isAlreadyLiked) {
            likeBtn.removeClass("job-liked-btn")
            currCount -= 1
        }
        else {
            likeBtn.addClass("job-liked-btn");
            currCount += 1
            jobItem.isLike=true;
        }
        countEl.html(currCount);
    });
}

function cleanJobs(){
    $('#jobs').empty();

}
function handleLocationFilter(jobs) {
    const locations = getLocations(jobs);
    const options=locations.map((i)=>$(`<option value="${i}">${i}</option>`))
    const geoFilter = $("#geo-filter");
    geoFilter.append(options);
    geoFilter.on("change", function (e){
        const {value}=e.target;
let filteredJobs;
        if(value===''){
            filteredJobs=jobs
        }
        else{

            filteredJobs = jobs.filter((i)=>i.location===value)
        }
        cleanJobs();
        showJobs(filteredJobs);

    })
}
function getLocations(jobs) {
const locations=jobs.map(i=>i.location) 
let uniques= new Set(locations);
return [...uniques].slice(0,5);

}
function handleFavFilter(jobs){
    const favFilter = $('#fav-filter');
    favFilter.on('change',function(e){
        const {value} = e.target;
        let filteredJobs;
        if(value==="" || value === "all"){
            filteredJobs=jobs;
        }else{
            filteredJobs=jobs.filter((i)=>String(i.isLike)===value)
        }
        cleanJobs();
        showJobs(filteredJobs);
    });
}
function searchFilter(jobs) {
    const searchBox = $("#job-search");
    console.log("inside search")
    searchBox.on("input", function (e) {  // Use 'input' instead of 'change' for better real-time filtering
        const { value } = e.target;
        let filteredJobs;

        if (value == "") {  // Handle empty input properly
            filteredJobs = jobs;
        } else {
            filteredJobs = jobs.filter(
                (i) =>
                i.title.toLowerCase().includes(value.toLowerCase()) ||
                i.company_name.toLowerCase().includes(value.toLowerCase())
            );
        }
        console.log(filteredJobs);
        cleanJobs();
        showJobs(filteredJobs);
        
    });
}



getjobs();