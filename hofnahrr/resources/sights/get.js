var that = this;
if (this.pictures) {
    this.pictures.forEach(function (pic, i) {
        if (!pic.id) {
            var name = pic.name;
            if (!name) {
                name = /[^\/]+$/.exec(pic.url)[0];
                that.pictures[i].name = name;
            }
            that.pictures[i].id = name;
        }
    });
    this.icon = this.pictures[0];
}