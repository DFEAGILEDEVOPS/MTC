def machineIndex=0;
def floodNodeIndex = vars.get("FLOOD_NODE_INDEX");
log.info("FLOOD_NODE_INDEX:" + floodNodeIndex);
log.info("machineIndex:" + machineIndex);

def lastTeacher = (machineIndex + 1) * 1000;
def firstTeacher = lastTeacher - 999;
log.info("node range is " + firstTeacher + " to " + lastTeacher);

def threadNumber = ctx.getThreadNum();
log.info("threadNumber:" + threadNumber);

def thisTeacher = firstTeacher + (threadNumber - 1);
log.info("thisTeacher:" + threadNumber);
vars.put("teacherIndex", thisTeacher);

