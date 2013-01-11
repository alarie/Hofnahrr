console.log(this);
if (this.unknown || me) {
    if (typeof this.unknown === 'undefined' || this.unknown === false) {
        this.unknown = false;
        this.creator = me.id;
    }
    else {
        this.verified = true;
        this.creator = "system";
    }
    this.speakingId = this.name.toLowerCase().replace(/[\s!\?\$\.:]/g, '-');
}
else {    
    cancel("You are not authorized to do that", 401);
}
