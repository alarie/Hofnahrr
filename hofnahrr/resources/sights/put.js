delete this.index;
if (this.unknown || me) {
    if (typeof this.unknown === 'undefined' || this.unknown === false) {
        this.unknown = false;
    }
    else {
        this.verified = true;
    }
    this.speakingId = this.name.toLowerCase().replace(/[\s!\?\$\.:]/g, '-');
}
else {
    cancel("You are not authorized to do that", 401);
}
