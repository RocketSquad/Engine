

export default class RMath {
    // Real men use radians
    static pi = 3.141592653;
    static tau = 2*RMath.pi;
    static degreeToRad = RMath.pi/180;
    static radToDegree = 180/RMath.pi;
    static SmallestAngleBetweenAngles(target: number, source: number) {
        let deltaAngle = (target - source);

        deltaAngle = (((deltaAngle + RMath.pi) % RMath.tau + RMath.tau) % RMath.tau) - RMath.pi;

        return deltaAngle;
    }
}
