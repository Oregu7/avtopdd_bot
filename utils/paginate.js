module.exports = ({ page, pages } = {}) => {
    let next = page + 1;
    let previous = page - 1;

    if (next > pages) next = 1;
    if (previous <= 0) previous = pages;

    return {
        next,
        previous,
    };
};